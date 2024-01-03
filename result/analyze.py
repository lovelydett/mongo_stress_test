import matplotlib.pyplot as plt
import csv

# constants
B_TO_MB = 1 / 1024 / 1024
B_TO_GB = 1 / 1024 / 1024 / 1024


def analyzeMemoryUsage():
    # load data
    data = []
    with open('result.csv', 'r') as f:
        reader = csv.reader(f)
        data = list(reader)

    data = data[1:]

    numDocuments = [int(d[0]) for d in data]
    numVettable = [int(d[1]) for d in data]
    totalSize = [int(d[2]) * B_TO_GB for d in data]
    indexSize = [int(d[3]) * B_TO_MB for d in data]

    # plot two sub graphs for total size and index size
    # fig, axs = plt.subplots(2, 1, figsize=(15, 10))
    # axs[0].plot(numDocuments, totalSize)
    # axs[0].set_title('Total Size')
    # axs[0].set_xlabel('Number of Documents')
    # axs[0].set_ylabel('Size (GB)')
    # axs[0].grid(True)

    # axs[1].plot(numDocuments, indexSize)
    # axs[1].set_title('Index Size')
    # axs[1].set_xlabel('Number of Documents')
    # axs[1].set_ylabel('Size (MB)')
    # axs[1].grid(True)

    # plt.savefig('result.png')

    # plot only index size
    plt.plot(numDocuments, indexSize)
    plt.title('Index Size')
    plt.xlabel('Number of Documents')
    plt.ylabel('Size (MB)')
    plt.grid(True)
    plt.show()


def analyzeConcurrency():
    # load data
    data = []
    with open('query_result2.csv', 'r') as f:
        reader = csv.reader(f)
        data = list(reader)
    data = data[1:]

    numThreads = [int(d[2]) for d in data]
    avgLatency = [float(d[3]) for d in data]

    # plot
    plt.plot(numThreads, avgLatency)
    plt.title('Search Documents')
    plt.xlabel('Number of Threads')
    plt.ylabel('Average Latency (ms)')
    plt.grid(True)
    plt.show()


if __name__ == '__main__':
    analyzeMemoryUsage()
    # analyzeConcurrency()
