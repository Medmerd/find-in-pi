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