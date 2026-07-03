# Phone Number Finder in Pi

An interactive CLI application that cleans and validates a 10-digit phone number, breaks it down into all possible substrings of length $\ge 2$, and searches for the first occurrence of these substrings within the digits of Pi.

## Python Version

---

### Features

- **Interactive Loop**: Prompts the user repeatedly for phone number input until they type `exit` or `quit`.
- **Input Sanitization & Validation**: Automatically strips non-numeric formatting characters (like `()`, `-`, and spaces) and validates that the cleaned phone number is exactly 10 digits.
- **Substring Generation**: Extracts all unique substrings of the phone number that are at least 2 digits long, sorting them in descending order of length to prioritize the longest matches.
- **Memory-Mapped Search**: Loads the dataset (`pi.txt`) using memory mapping (`mmap`) to search for matching patterns directly in virtual memory. This avoids copying the file contents into the Python heap, reducing RAM footprint and improving speed.

---

### Requirements

- Python 3.x
- A text file named `pi.txt` (containing the digits of Pi) in the project root directory (the parent of the `python/` directory).

---

### Installation & Running

1. **Verify Python 3**:
   Make sure you have Python 3 installed. You can check your version with:
   ```bash
   python3 --version
   ```

2. **Prepare the Data**:
   Ensure `pi.txt` is located in the project root (one directory above `main.py`).

3. **Run the Application**:
   Navigate to the `python/` directory and execute the script:
   ```bash
   cd python
   python3 main.py
   ```

4. **Using the CLI**:
   - Enter a phone number when prompted (e.g. `(141) 592-6535` or `123-456-7890`).
   - The script will report the first match found, its length, and its index in `pi.txt`.
   - Type `exit` or `quit` to close the program.

---

## JavaScript Version

---

### Requirements

- Node.js (version 24.0.0 or higher)
- A text file named `pi.txt` (containing the digits of Pi) in the parent or `javascript/` directory.

---

### Installation & Running

---

1. **Verify Node.js**:
   Make sure you have Node.js installed:
   ```bash
   node --version
   ```

2. **Navigate to the Directory**:
   ```bash
   cd javascript
   ```

3. **Run the Application**:
   ```bash
   node index.js
   ```

4. **Using the CLI**:
   - Enter a phone number when prompted (e.g. `(141) 592-6535` or `123-456-7890`).
   - The script will report the first match found, its length, and its index in `pi.txt`.
   - Type `exit` or `quit` to close the program.

---

## Golang Version

A pure Golang implementation of the application is available in the `golang/` directory. This version leverages Go's built-in `index/suffixarray` to pre-compile an index of Pi in memory. While the initial data load takes a few seconds to build the Suffix Array, subsequent searches complete in mere **microseconds** due to logarithmic $O(\log N)$ binary search times.

### Requirements

- Go 1.x
- A text file named `pi.txt` (containing the digits of Pi) in the project root directory (the parent of the `golang/` directory).

---

### Installation & Running

1. **Verify Go**:
   Make sure you have Go installed:
   ```bash
   go version
   ```

2. **Navigate to the Directory**:
   ```bash
   cd golang
   ```

3. **Run the Application**:
*Note: The first run will take 10-12 seconds to compile the data into `pi_index.bin`. All subsequent runs will load almost instantly.*
   ```bash
   go run main.go
   ```

4. **Using the CLI**:
   - Enter a phone number when prompted (e.g. `(141) 592-6535` or `123-456-7890`).
   - The script will report the first match found, its length, and its index in `pi.txt`.
   - Type `exit` or `quit` to close the program.


# Trade Offs

Python and Javascript implementations are more than fast enough to be used for lower length PI data sets searching for a number. However the GoLang version seems to be a much more real path forward to mulit-user service and would scale to almost amount PI dataset the hardware could handle. 

## Python

### Pros:

* Fast Startup: Memory-mapping (mmap) the file takes practically zero time, meaning the CLI is ready instantly.
* Low Memory Overhead: Because it relies on OS-level virtual memory mapping, it uses almost no RAM beyond the actual file size.

### Cons:

* Search Speed: It uses a linear scan. While fast enough for 1 million digits (takes ~0.15ms), it scales linearly ($O(N)$) and would be noticeably slow on files with billions of digits.
* Concurrency Limitations: Python's Global Interpreter Lock (GIL) prevents true multi-threading if you ever wanted to host this as a multi-user web service.

## JavaScript (Node.js)

### Pros:

* Fast Linear Search: Buffer.indexOf is backed by highly optimized C++ substring algorithms, making it incredibly fast for linear scans and avoiding JavaScript string overhead.

### Cons:

* Event Loop Blocking: Buffer.indexOf is a synchronous, CPU-bound operation. It completely blocks Node's single thread while searching.
* Memory Cost: Reading the file into a Node Buffer copies the entire file into V8's heap memory. This could easily crash the process with Out-of-Memory errors if the dataset was several gigabytes.

## Golang

### Pros:

* Performance: Utilizes a pre-compiled Suffix Array to achieve logarithmic $O(\log N)$ binary search times. Searches complete in mere microseconds and scale to billions of digits.
* Standalone: Compiles into a single, standalone binary executable. End-users don't need to install Go, Node, or Python to run it.
* Concurrency: Fully thread-safe. You can spin up an HTTP server and serve thousands of concurrent search requests simultaneously using goroutines.

### Cons:

* Startup Time: (Resolved) By caching the Suffix Array to disk (`pi_index.bin`), the startup time drops from 10-12 seconds down to less than a second on subsequent runs.
* Memory Heavy: The Suffix Array requires an integer pointer for every character in the string. The serialized cache file consumes roughly 4x to 5x the disk space of the original text file.