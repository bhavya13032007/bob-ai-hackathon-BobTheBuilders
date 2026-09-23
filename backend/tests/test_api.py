def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_internships_empty(client):
    response = client.get("/internships")
    assert response.status_code == 200
    # Before seeding, it might be empty or seeded. Depending on db state.
    # Assuming the test db is empty initially:
    assert isinstance(response.json(), list)

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "online"
