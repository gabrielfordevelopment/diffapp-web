# DiffApp

DiffApp is a free and open-source utility built with **Next.js**, **React**, and **TypeScript**.

It is designed to provide high-precision text comparison and flexible merging capabilities, allowing developers to analyze and synchronize differences between two text sources with ease directly in the browser or as a standalone cross-platform application.

> **Note:**  
> This project is currently **under development**.

## 🚀 Main Features

-   **Dual View Modes:** Switch between **Split (Side-by-Side)** and **Unified** views to visualize differences in the way that suits you best.
-   **High-Precision Highlighting:** Choose between **Word-level** or **Character-level** highlighting to spot even the smallest changes.
-   **Flexible Merging:** Interactively merge changes block-by-block from left-to-right or right-to-left to build the final result.
-   **Smart Comparison:** Optional "Ignore Whitespace" toggle to focus only on meaningful code or text changes.
-   **Integrated Editor & History:** Edit texts on the fly, re-run comparisons instantly, and automatically save your diffs to your local history.

## 🛠 Technology Stack

-   **Framework:** Next.js & React
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **Engine:** `diff` (npm)
-   **State Management:** Zustand
-   **Database:** Dexie (IndexedDB)
-   **Icons:** React Icons (Material Design)

## 📖 How to Use

1.  **Input Text:** Paste or type your original text in the left panel and the modified version in the right panel.
2.  **Compare:** Click the **Find Difference** button to generate the visual comparison.
3.  **Analyze & Merge:**
    -   Select a difference block to reveal merge controls.
    -   Use the arrow buttons to move changes between sides.
    -   Toggle **Word Wrap** or **View Mode** in the Settings panel for better visibility.
4.  **Export:** Copy the final result back to your clipboard using the quick-copy buttons.

## 📄 License

This project is open-source and free to use.
