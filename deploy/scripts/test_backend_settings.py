import unittest

from update_backend_secret import merge_properties, REQUIRED_KEYS


class BackendSettingsTest(unittest.TestCase):
    def current(self):
        return "\n".join(f"{key}=server-value" for key in sorted(REQUIRED_KEYS)) + "\nJWT_SECRET=keep-signing-key\nunknown.server.key=keep\n"

    def test_changes_selected_values_but_preserves_server_credentials(self):
        result, changed = merge_properties(self.current(), "kakao.client-id=new-app\nspring.datasource.password=wrong-local\nspring.data.redis.password=wrong-local\n")
        self.assertIn("kakao.client-id=new-app", result)
        self.assertIn("spring.datasource.password=server-value", result)
        self.assertIn("spring.data.redis.password=server-value", result)
        self.assertIn("JWT_SECRET=keep-signing-key", result)
        self.assertIn("unknown.server.key=keep", result)
        self.assertEqual(changed, ["kakao.client-id"])

    def test_can_supply_previously_missing_ai_token(self):
        current = self.current().replace("quiz.ai.token=server-value\n", "")
        result, changed = merge_properties(current, "quiz.ai.token=example-token\n")
        self.assertIn("quiz.ai.token=example-token", result)
        self.assertEqual(changed, ["quiz.ai.token"])

    def test_missing_required_value_is_rejected(self):
        with self.assertRaises(ValueError):
            merge_properties("spring.datasource.username=example\n", "kakao.client-id=example\n")

    def test_empty_duplicate_and_continued_values_are_rejected(self):
        for source in ["kakao.client-id=\n", "kakao.client-id=one\nkakao.client-id=two\n", "kakao.client-id=value\\\nnext-line"]:
            with self.assertRaises(ValueError):
                merge_properties(self.current(), source)


if __name__ == "__main__":
    unittest.main()
