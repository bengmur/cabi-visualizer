def normalize_value(val, min_, max_):
    normalized = (val - min_) / (max_ - min_)
    return normalized
