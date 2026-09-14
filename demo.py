import multiprocessing

def worker():
    # Run this in each of the processes
    while True:
        pass

if __name__ == "__main__":
    # Spawn 12 system-level processes
    for _ in range(12):
        p = multiprocessing.Process(target=worker)
        p.start()