import os
import sys
import mmap
import time

# Global variables to hold mapping descriptors
piFile = None
piMap = None

# Write the sections between 2 timers
def writeTime(startTime, sectionName):
    endTime = time.perf_counter()
    print(f"{sectionName} time: {endTime - startTime} seconds")

def cleanInput(userInput):
    """Remove all non-numeric characters from the input using fast digit filtering."""
    return "".join(c for c in userInput if c.isdigit())

def validatePhone(digits):
    """Verify that the cleaned string contains exactly 10 digits."""
    return len(digits) == 10

def readMappedFile(filename):
    global piFile, piMap
    # Verify the file exists before attempting to open it
    if not os.path.exists(filename):
        print(f"Error: '{filename}' file was not found in the current directory.", file=sys.stderr)
        sys.exit(1)
        
    
    # Keep the file object open so the memory map descriptor remains valid
    piFile = open(filename, mode="rb")
    # Create a read-only memory map of the entire file
    piMap = mmap.mmap(piFile.fileno(), length=0, access=mmap.ACCESS_READ)
   

def closeMappedFile():
    global piFile, piMap
    if piMap:
        piMap.close()
    if piFile:
        piFile.close()

def splitNumber(phoneDigits):
    # Pre-convert phoneDigits to bytes to extract byte substrings directly
    phoneBytes = phoneDigits.encode('ascii')
    length = len(phoneBytes)
    uniqueSubs = set()

    # Loop substring lengths from original length down to 2
    for subLen in range(length, 1, -1):
        # Extract substrings front to back
        for i in range(length - subLen + 1):
            sub = phoneBytes[i:i+subLen]
            uniqueSubs.add(sub)
            
    # Sort the unique byte substrings in descending order of length
    sortedSubs = sorted(uniqueSubs, key=len, reverse=True)
    return sortedSubs

def searchPhoneInPi(phoneDigits):
    global piMap
    subsList = splitNumber(phoneDigits)
    
    # Search for each substring in descending order of length, stopping at the first match
    foundMatch = None
    foundIndex = -1
    for sub in subsList:
        idx = piMap.find(sub)  # No encoding needed here since sub is already bytes
        if idx != -1:
            foundMatch = sub.decode('ascii')
            foundIndex = idx
            break

    return foundIndex, foundMatch
   
def main():
    print("=== Phone Number Finder ===")
    print("Type 'exit' or 'quit' (or press Ctrl+C/Ctrl+D) to exit.\n")

    try:
        # Load/map the data from the file before we start
        print("=== Loading Pi Data ===")
        startTime = time.perf_counter()
        readMappedFile("pi.txt")
        writeTime(startTime, "Data Loaded")
        print("\n")

        while True:
            try:
                userInput = input("Enter a 10-digit phone number: ")
            except (KeyboardInterrupt, EOFError):
                print("\nExiting. Goodbye!")
                break
                
            # Check exit commands
            if userInput.strip().lower() in ('exit', 'quit'):
                print("Exiting. Goodbye!")
                break
                
            cleaned = cleanInput(userInput)

            if not cleaned:
                print("Invalid Phone Number: Input contains no digits. Please try again.\n")
                continue
                
            if not validatePhone(cleaned):
                print(f"Invalid Phone Number: Cleaned number '{cleaned}' has {len(cleaned)} digits. It must be exactly 10 digits.\n")
                continue
            
            print(f"Phone Number: {cleaned}")
            print("Searching in pi.txt...")
            
            # Start the timer   
            startTime = time.perf_counter()
            
            # Do the search
            foundIndex, foundMatch = searchPhoneInPi(cleaned)
            
            # Write the time it took to search
            writeTime(startTime, "Match Search")

            if foundMatch is not None:
                print(f"   Found {foundMatch} (length {len(foundMatch)}) at index {foundIndex}\n")
            else:
                print("   No match found.\n")
    finally:
        # Ensure mapping descriptors are closed upon exiting
        closeMappedFile()

if __name__ == "__main__":
    main()
