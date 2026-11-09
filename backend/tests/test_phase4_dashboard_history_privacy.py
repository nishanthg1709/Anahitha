import pytest
from fastapi.testclient import TestClient
from main import app
from app.database import db
from tests.test_accounts_database import create_test_token

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db_state():
    db.reset()

def test_delete_individual_conversation_enforces_rls():
    """
    User A can delete their own conversation.
    User A CANNOT delete User B's conversation.
    """
    user_a = "user-a-uuid"
    user_b = "user-b-uuid"

    token_a = create_test_token(user_a)
    token_b = create_test_token(user_b)

    # Save a conversation for A and for B
    conv_a_id = db.save_chat_message(user_a, "chat", "Prompt A", "Reply A")
    conv_b_id = db.save_chat_message(user_b, "chat", "Prompt B", "Reply B")

    assert db.total_stored_messages() == 4

    # User A tries to delete User B's conversation -> rejected
    resp_attack = client.delete(
        f"/api/chat/conversations/{conv_b_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert resp_attack.status_code == 404

    # Verify User B's conversation and messages are still intact
    assert len(db.get_user_chat_history(user_b)) == 1

    # User A deletes their own conversation -> succeeds
    resp_delete_a = client.delete(
        f"/api/chat/conversations/{conv_a_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert resp_delete_a.status_code == 200
    assert len(db.get_user_chat_history(user_a)) == 0

    # User B's messages still remain
    assert db.total_stored_messages() == 2

def test_delete_all_user_data_purges_only_target_user():
    """
    DELETE /api/user/data purges all conversations and messages for User A,
    leaving User B's data completely untouched.
    """
    user_a = "user-a-uuid"
    user_b = "user-b-uuid"

    token_a = create_test_token(user_a)
    token_b = create_test_token(user_b)

    db.save_chat_message(user_a, "chat", "Msg A1", "Reply A1")
    db.save_chat_message(user_a, "chat", "Msg A2", "Reply A2")
    db.save_chat_message(user_b, "chat", "Msg B1", "Reply B1")

    assert db.total_stored_messages() == 6

    # User A deletes all their data
    resp = client.delete(
        "/api/user/data",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

    # User A history is now empty
    assert len(db.get_user_chat_history(user_a)) == 0

    # User B history is still present with 2 messages
    history_b = db.get_user_chat_history(user_b)
    assert len(history_b) == 1
    assert len(history_b[0]["messages"]) == 2

def test_profile_endpoints_get_and_update():
    """
    GET and PUT /api/user/profile manage display name.
    """
    user_id = "user-profile-uuid"
    token = create_test_token(user_id, "me@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch initial profile
    get_resp = client.get("/api/user/profile", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == user_id

    # Update profile display name
    put_resp = client.put(
        "/api/user/profile",
        json={"display_name": "Dr. Anahitha Fan"},
        headers=headers,
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["display_name"] == "Dr. Anahitha Fan"
