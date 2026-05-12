import unittest

class TestCoreFunctionality(unittest.TestCase):
    def test_addition(self):
        self.assertEqual(1 + 1, 2)
        print("✅ Addition test passed")

    def test_string_uppercase(self):
        self.assertEqual("hello".upper(), "HELLO")
        print("✅ String test passed")

    def test_boolean_logic(self):
        self.assertTrue(True and not False)
        print("✅ Boolean logic test passed")

if __name__ == '__main__':
    unittest.main()
