import unittest

class TestSimple(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)
    
    def test_false(self):
        self.assertFalse(False)
    
    def test_equality(self):
        self.assertEqual(1, 1)

if __name__ == '__main__':
    unittest.main()
