
"""
Random utilities that don't really have any other place to live.
"""

from __future__ import print_function
from subprocess import check_output, STDOUT
from settings import BASE_DIR


def execute_git_log():

    """run git log and parse it to get our most recent commit and display it"""

    try:
        history = check_output(["git", "--git-dir", BASE_DIR + '/.git', "log", "--no-merges"], stderr=STDOUT)

        history = history.split("\n")[0:6]

        commit = {"commit": history[0],
                  "author": history[1],
                  "date": history[2],
                  "message": history[4].strip()}

        label = ' '.join(commit['date'].split(' ')[3:7])
        commit['label'] = label

    except Exception, e:
        print("there was an error! {0}".format(e))
        commit = {"commit": "unknown",
                  "author": "unknown",
                  "date": "unknown",
                  "message": "unknown"}

        try:
            out = check_output(["git", "--git-dir", BASE_DIR + '/.git', "status"], stderr=STDOUT)
            print("this was out: {0}".format(out))

        except Exception, e:
            print("there was another error! {0}".format(e))

    return commit


if __name__ == "__main__":
    message = execute_git_log()
    print(message)
