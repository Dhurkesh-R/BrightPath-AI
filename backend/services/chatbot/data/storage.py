import json

class Storage:
    def __init__(self, path="data.json"):
        self.path = path

    def load(self):
        try:
            with open(self.path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def save(self, data):
        with open(self.path, "w") as f:
            json.dump(data, f, indent=2)
