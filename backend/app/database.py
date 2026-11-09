import uuid
import threading
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

class ChatDatabase:
    """
    Thread-safe repository for conversations and messages.
    Enforces strict Row Level Security (RLS) simulation:
    Each user can only view, insert, update, or delete rows where user_id matches.
    Guests (None user_id) never store any rows.
    """

    def __init__(self):
        self._lock = threading.RLock()
        # Storage structures
        # conversations: { conv_id: { "id": str, "user_id": str, "title": str, "mode": str, "created_at": str } }
        self._conversations: Dict[str, Dict[str, Any]] = {}
        # messages: list of dicts with conversation_id, user_id, sender, content, is_emergency, mode, created_at
        self._messages: List[Dict[str, Any]] = []
        # profiles: { user_id: { "id": str, "display_name": str, "email": str, "created_at": str } }
        self._profiles: Dict[str, Dict[str, Any]] = {}

    def save_chat_message(
        self,
        user_id: Optional[str],
        mode: str,
        user_content: str,
        assistant_content: str,
        is_emergency: bool = False,
        conversation_id: Optional[str] = None,
    ) -> Optional[str]:
        """
        Saves a chat exchange (user prompt + assistant response).
        GUEST PROTECTION: If user_id is None, STORES NOTHING and returns None.
        """
        if not user_id:
            # Guest messages are NEVER stored
            return None

        with self._lock:
            now_iso = datetime.now(timezone.utc).isoformat()

            # Find or create conversation for this user
            conv_id = conversation_id
            if not conv_id or conv_id not in self._conversations:
                # Derive title from first words of user content
                title = (user_content[:40] + "...") if len(user_content) > 40 else user_content
                conv_id = str(uuid.uuid4())
                self._conversations[conv_id] = {
                    "id": conv_id,
                    "user_id": user_id,
                    "title": title or "Health Conversation",
                    "mode": mode,
                    "created_at": now_iso,
                    "updated_at": now_iso,
                }
            else:
                # Enforce RLS on existing conversation
                if self._conversations[conv_id]["user_id"] != user_id:
                    raise PermissionError("RLS Violation: Cannot insert messages into another user's conversation")

            # 1. Insert User Message
            self._messages.append({
                "id": str(uuid.uuid4()),
                "conversation_id": conv_id,
                "user_id": user_id,
                "sender": "user",
                "content": user_content,
                "mode": mode,
                "is_emergency": is_emergency,
                "created_at": now_iso,
            })

            # 2. Insert Assistant Message
            self._messages.append({
                "id": str(uuid.uuid4()),
                "conversation_id": conv_id,
                "user_id": user_id,
                "sender": "anahitha",
                "content": assistant_content,
                "mode": mode,
                "is_emergency": is_emergency,
                "created_at": now_iso,
            })

            return conv_id

    def get_user_chat_history(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all conversations and nested messages for user_id.
        STRICT RLS: Only returns rows where user_id matches.
        """
        if not user_id:
            return []

        with self._lock:
            # Filter conversations by user_id (RLS SELECT policy)
            user_convs = [
                conv for conv in self._conversations.values()
                if conv["user_id"] == user_id
            ]

            # Sort latest first
            user_convs.sort(key=lambda c: c["created_at"], reverse=True)

            result = []
            for conv in user_convs:
                # Filter messages belonging to this conversation AND this user
                conv_msgs = [
                    m for m in self._messages
                    if m["conversation_id"] == conv["id"] and m["user_id"] == user_id
                ]
                conv_msgs.sort(key=lambda m: m["created_at"])
                result.append({
                    **conv,
                    "messages": conv_msgs,
                })

            return result

    def delete_conversation(self, user_id: str, conversation_id: str) -> bool:
        """
        Deletes a specific conversation and its associated messages.
        Enforces Row Level Security: Returns False if the conversation does not belong to user_id.
        """
        if not user_id or not conversation_id:
            return False

        with self._lock:
            conv = self._conversations.get(conversation_id)
            if not conv:
                return False
            if conv["user_id"] != user_id:
                # RLS: Cannot delete another user's conversation
                return False

            del self._conversations[conversation_id]
            self._messages = [
                m for m in self._messages
                if m["conversation_id"] != conversation_id
            ]
            return True

    def get_user_profile(self, user_id: str, default_email: str = "") -> Dict[str, Any]:
        """
        Returns profile for user_id.
        """
        with self._lock:
            if user_id not in self._profiles:
                now_iso = datetime.now(timezone.utc).isoformat()
                self._profiles[user_id] = {
                    "id": user_id,
                    "email": default_email,
                    "display_name": default_email.split("@")[0] if "@" in default_email else "User",
                    "created_at": now_iso,
                    "updated_at": now_iso,
                }
            return dict(self._profiles[user_id])

    def update_user_profile(self, user_id: str, display_name: str) -> Dict[str, Any]:
        """
        Updates profile display name.
        """
        with self._lock:
            profile = self.get_user_profile(user_id)
            profile["display_name"] = display_name.strip()
            profile["updated_at"] = datetime.now(timezone.utc).isoformat()
            self._profiles[user_id] = profile
            return dict(profile)

    def delete_user_data(self, user_id: str) -> int:
        """
        Deletes all conversations and messages belonging to user_id.
        """
        if not user_id:
            return 0

        with self._lock:
            # Delete messages
            self._messages = [m for m in self._messages if m["user_id"] != user_id]

            # Delete conversations
            initial_count = len(self._conversations)
            self._conversations = {
                cid: c for cid, c in self._conversations.items()
                if c["user_id"] != user_id
            }

            # Delete profile
            if user_id in self._profiles:
                del self._profiles[user_id]

            return initial_count - len(self._conversations)

    def total_stored_messages(self) -> int:
        with self._lock:
            return len(self._messages)

    def reset(self):
        """Reset storage for test isolation."""
        with self._lock:
            self._conversations.clear()
            self._messages.clear()
            self._profiles.clear()

# Global database instance
db = ChatDatabase()
