const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { performance } = require('perf_hooks');

/**
 *  hold the pi data
 */
let piData = null;

/**
 *  Write the sections between 2 timers
 */
function writeTime(startTime, sectionName) {
    const endTime = performance.now();
    // Convert ms from performance.now() to seconds
    const elapsedSeconds = (endTime - startTime) / 1000;
    console.log(`${sectionName} time: ${elapsedSeconds.toFixed(6)} seconds`);
}

/**
 *  Remove all non-numeric characters from the input using fast digit filtering
 */
function cleanInput(userInput) {
    let cleaned = '';
    for (let i = 0; i < userInput.length; i++) {
        const char = userInput[i];
        if (char >= '0' && char <= '9') {
            cleaned += char;
        }
    }
    return cleaned;
}

/**
 *  Verify that the cleaned string contains exactly 10 digits
 */
function validatePhone(digits) {
    return digits.length === 10;
}

/**
 *  Verify file existence and read file into a Buffer
 */
function readMappedFile(filename) {
    piData = null;

    // Check local directory first, then fallback to parent directory
    let filepath = filename;
    if (!fs.existsSync(filepath)) {
        filepath = path.join(__dirname, '..', filename);
    }

    if (!fs.existsSync(filepath)) {
        console.error(`Error: '${filename}' file was not found in the current or parent directory.`, file = process.stderr);
        process.exit(1);
    }

    try {
        // Read file into a Buffer (Node.js Buffer is memory-efficient and fast for binary searching)
        piData = fs.readFileSync(filepath);
    } catch (e) {
        console.error(`Error loading '${filename}': ${e.message}`, file = process.stderr);
        process.exit(1);
    }
}

/**
 *  Extract unique substrings of length >= 2, sorted by length descending
 */
function splitNumber(phoneDigits) {
    const n = phoneDigits.length;
    const uniqueSubs = new Set();

    // Loop substring lengths from original length down to 2
    for (let subLen = n; subLen >= 2; subLen--) {
        // Extract substrings front to back
        for (let i = 0; i <= n - subLen; i++) {
            const sub = phoneDigits.substring(i, i + subLen);
            uniqueSubs.add(sub);
        }
    }

    // Sort unique substrings in descending order of length
    const sortedSubs = Array.from(uniqueSubs).sort((a, b) => b.length - a.length);
    return sortedSubs;
}

/**
 *  Search for substrings sequentially, returning the first match to short-circuit
 */
function searchPhoneInPi(phoneDigits) {
    const subsList = splitNumber(phoneDigits);

    for (const sub of subsList) {
        // Pre-allocate Buffer to avoid internal string-to-byte conversion overhead
        const subBuffer = Buffer.from(sub, 'utf8');
        const index = piData.indexOf(subBuffer);

        if (index !== -1) {
            return { sub, index };
        }
    }

    return null;
}

/**
 *  Launch the interactive CLI loop and handle file mapping
 */
function main() {
    console.log('=== Phone Number Finder ===');
    console.log(`Type "exit" or "quit" (or press Ctrl+C/Ctrl+D) to exit.\n`);

    try {
        // Load/map the data from the file before we start
        console.log('=== Loading Pi Data ===');
        const startTime = performance.now();
        readMappedFile("pi.txt");
        writeTime(startTime, "Data Loaded");
        console.log("\n");

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const promptUser = () => {
            rl.question("Enter a 10-digit phone number: ", (userInput) => {
                const trimmed = userInput.trim().toLowerCase();
                if (trimmed === 'exit' || trimmed === 'quit') {
                    console.log('Exiting. Goodbye!');
                    rl.close();
                    return;
                }

                const cleaned = cleanInput(userInput);

                if (!cleaned) {
                    console.log('Invalid Phone Number: Input contains no digits. Please try again.\n');
                    promptUser();
                    return;
                }

                if (!validatePhone(cleaned)) {
                    console.log(`Invalid Phone Number: Cleaned number '${cleaned}' has ${cleaned.length} digits. It must be exactly 10 digits.\n`);
                    promptUser();
                    return;
                }

                console.log(`Phone Number: ${cleaned}\nSearching in pi.txt...`);

                // Start the timer
                const startTimeSearch = performance.now();

                // Do the search
                const firstMatch = searchPhoneInPi(cleaned);

                // Write the time it took to search
                writeTime(startTimeSearch, "Match Search");

                if (firstMatch) {
                    console.log(`   Found ${firstMatch.sub} (length ${firstMatch.sub.length}) at index ${firstMatch.index}\n`);
                } else {
                    console.log('  No match found.\n');
                }

                promptUser();
            });
        };

        rl.on('SIGINT', () => {
            console.log('\nExiting. Goodbye!');
            rl.close();
        });

        promptUser();
    } catch (e) {
        console.error(`An unexpected error occurred: ${e.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
