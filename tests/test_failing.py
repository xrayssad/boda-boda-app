import unittest

class TestFailing(unittest.TestCase):
    def test_that_fails(self):
        # This test is designed to fail intentionally for CI/CD demo
        self.assertEqual(1, 2, "This test fails intentionally - demonstrates pipeline failure")

if __name__ == '__main__':
    unittest.main()
