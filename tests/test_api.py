import unittest
import requests
import json

class TestAPI(unittest.TestCase):
    
    def test_backend_health(self):
        """Test if backend API is responding"""
        try:
            response = requests.get('http://localhost:8000/api/rides/', timeout=3)
            self.assertEqual(response.status_code, 200)
        except requests.ConnectionError:
            self.skipTest("Backend not running - skipping API test")

if __name__ == '__main__':
    unittest.main()
