package main

import (
	"bufio"
	"bytes"
	"fmt"
	"index/suffixarray"
	"os"
	"strings"
	"time"
)

// cleanInput removes all non-numeric characters from the input
func cleanInput(input string) string {
	var cleaned bytes.Buffer
	for _, char := range input {
		if char >= '0' && char <= '9' {
			cleaned.WriteRune(char)
		}
	}
	return cleaned.String()
}

// splitNumber generates substrings from length 10 down to 2
func splitNumber(phone string) []string {
	var subs []string
	n := len(phone)
	for subLen := n; subLen >= 2; subLen-- {
		for i := 0; i <= n-subLen; i++ {
			subs = append(subs, phone[i:i+subLen])
		}
	}
	return subs
}

func main() {
	fmt.Println("=== Phone Number Finder ===")
	fmt.Println("Type \"exit\" or \"quit\" (or press Ctrl+C/Ctrl+D) to exit.")

	fmt.Println("=== Loading Pi Data ===")
	startLoad := time.Now()

	// Try reading from parent directory first, then local
	filename := "../pi.txt"
	data, err := os.ReadFile(filename)
	if err != nil {
		filename = "pi.txt"
		data, err = os.ReadFile(filename)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: 'pi.txt' file was not found in the current or parent directory.\n")
			os.Exit(1)
		}
	}

	// Build the Suffix Array
	index := suffixarray.New(data)

	elapsedLoad := time.Since(startLoad).Seconds()
	fmt.Printf("Data Loaded time: %.6f seconds\n\n", elapsedLoad)

	scanner := bufio.NewScanner(os.Stdin)
	for {
		fmt.Print("Enter a 10-digit phone number: ")
		if !scanner.Scan() {
			fmt.Println("Exiting. Goodbye!")
			break
		}
		userInput := scanner.Text()
		trimmed := strings.ToLower(strings.TrimSpace(userInput))
		if trimmed == "exit" || trimmed == "quit" {
			fmt.Println("Exiting. Goodbye!")
			break
		}

		cleaned := cleanInput(userInput)
		if len(cleaned) == 0 {
			fmt.Println("Invalid Phone Number: Input contains no digits. Please try again.")
			continue
		}

		if len(cleaned) != 10 {
			fmt.Printf("Invalid Phone Number: Cleaned number '%s' has %d digits. It must be exactly 10 digits.\n\n", cleaned, len(cleaned))
			continue
		}

		fmt.Printf("Phone Number: %s\n", cleaned)
		fmt.Println("Searching in pi.txt...")

		startSearch := time.Now()

		subs := splitNumber(cleaned)
		var matchSub string
		var matchIndex int = -1

		for _, sub := range subs {
			// Find at most 1 match for this substring
			matches := index.Lookup([]byte(sub), 1)
			if len(matches) > 0 {
				matchSub = sub
				matchIndex = matches[0]
				break
			}
		}

		elapsedSearch := time.Since(startSearch).Seconds()
		fmt.Printf("Match Search time: %.6f seconds\n", elapsedSearch)

		if matchIndex != -1 {
			fmt.Printf("   Found %s (length %d) at index %d\n\n", matchSub, len(matchSub), matchIndex)
		} else {
			fmt.Println("  No match found.")
		}
	}

	if err := scanner.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "Reading standard input:", err)
	}
}
