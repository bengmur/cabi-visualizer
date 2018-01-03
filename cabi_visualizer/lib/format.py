def format_duration(seconds):
    """Format seconds into humanized hours, minutes, seconds."""
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)

    time_str = ''
    if hours:
        time_str += '{}h '.format(hours)
    if minutes:
        time_str += '{}m '.format(minutes)
    if seconds:
        time_str += '{}s'.format(seconds)

    return time_str.strip()


def pluralize(count, singular, plural=None):
    if not plural:
        plural = singular + 's'

    return '{} {}'.format(
        count,
        singular if count == 1 else plural,
    )
