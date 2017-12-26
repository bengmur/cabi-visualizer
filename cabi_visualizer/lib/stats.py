from collections import defaultdict


def determine_frequencies(keys):
    """Returns a dict of format:
    {
        element: frequency,
        ...
    }
    """
    frequencies = defaultdict(int)
    for key in keys:
        # Convert list to a hashable type
        if isinstance(key, list):
            key = tuple(key)
        frequencies[key] += 1

    return frequencies


def normalize_value(val, min_, max_):
    normalized = (float(val) - min_) / (max_ - min_)
    return normalized
