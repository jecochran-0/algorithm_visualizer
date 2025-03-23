// Sorting Algorithms

// Bubble Sort Algorithm
function bubbleSort(array) {
  const arr = [...array];
  const n = arr.length;
  const steps = [];
  // Track sorted positions
  const sortedPositions = new Set();

  for (let i = 0; i < n; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      // Record comparison
      steps.push({
        type: "comparison",
        indices: [j, j + 1],
        array: [...arr],
        currentValues: [arr[j], arr[j + 1]],
        message: `Comparing ${arr[j]} and ${arr[j + 1]}`,
        sortedPositions: new Set([...sortedPositions]),
      });

      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;

        // Record swap
        steps.push({
          type: "swap",
          indices: [j, j + 1],
          array: [...arr],
          currentValues: [arr[j], arr[j + 1]],
          message: `Swapping ${arr[j + 1]} and ${arr[j]}`,
          sortedPositions: new Set([...sortedPositions]),
        });
      }
    }

    // Mark the last n-i-1 element as sorted
    sortedPositions.add(n - i - 1);

    // Record the end of this pass
    steps.push({
      type: "passComplete",
      indices: [n - i - 1],
      array: [...arr],
      message: `Pass ${i + 1} complete. Element ${
        arr[n - i - 1]
      } is now in its sorted position.`,
      sortedPositions: new Set([...sortedPositions]),
    });

    // If no swapping occurred in this pass, the array is sorted
    if (!swapped) {
      // Mark all remaining positions as sorted
      for (let k = 0; k < n - i - 1; k++) {
        sortedPositions.add(k);
      }
      break;
    }
  }

  // Verify all positions are marked as sorted
  if (sortedPositions.size < arr.length) {
    const finalSortedPositions = new Set();
    for (let i = 0; i < arr.length; i++) {
      finalSortedPositions.add(i);
    }

    // Final step - array is fully sorted
    steps.push({
      type: "complete",
      indices: [],
      array: [...arr],
      message: "Array sorting complete",
      sortedPositions: finalSortedPositions,
    });
  } else {
    // Final step - array is fully sorted
    steps.push({
      type: "complete",
      indices: [],
      array: [...arr],
      message: "Array sorting complete",
      sortedPositions: sortedPositions,
    });
  }

  return steps;
}

// Selection Sort Algorithm
function selectionSort(array) {
  const arr = [...array];
  const n = arr.length;
  const steps = [];
  // Track sorted positions - only left side should be sorted in Selection Sort
  const sortedPositions = new Set();

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    // Record the start of a new iteration
    steps.push({
      type: "select",
      indices: [i, minIndex],
      array: [...arr],
      currentValues: [arr[i]],
      message: `Looking for minimum element starting from index ${i}`,
      sortedPositions: new Set([...sortedPositions]),
    });

    for (let j = i + 1; j < n; j++) {
      // Record comparison
      steps.push({
        type: "comparison",
        indices: [minIndex, j],
        array: [...arr],
        currentValues: [arr[minIndex], arr[j]],
        message: `Comparing current min ${arr[minIndex]} at index ${minIndex} with ${arr[j]} at index ${j}`,
        sortedPositions: new Set([...sortedPositions]),
      });

      if (arr[j] < arr[minIndex]) {
        // Update minimum
        const oldMinIndex = minIndex;
        minIndex = j;

        // Record minimum update
        steps.push({
          type: "updateMin",
          indices: [oldMinIndex, minIndex],
          array: [...arr],
          currentValues: [arr[oldMinIndex], arr[minIndex]],
          message: `Found new minimum ${arr[minIndex]} at index ${minIndex}`,
          sortedPositions: new Set([...sortedPositions]),
        });
      }
    }

    if (minIndex !== i) {
      // Swap
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];

      // Record swap
      steps.push({
        type: "swap",
        indices: [i, minIndex],
        array: [...arr],
        currentValues: [arr[i], arr[minIndex]],
        message: `Placing minimum value ${arr[i]} at position ${i}`,
        sortedPositions: new Set([...sortedPositions]),
      });
    } else {
      // Already in place
      steps.push({
        type: "inPlace",
        indices: [i],
        array: [...arr],
        currentValues: [arr[i]],
        message: `Value ${arr[i]} already in correct position ${i}`,
        sortedPositions: new Set([...sortedPositions]),
      });
    }

    // Mark position i as sorted
    sortedPositions.add(i);

    // Record element placement completion
    steps.push({
      type: "elementPlaced",
      indices: [i],
      array: [...arr],
      message: `Element ${arr[i]} is now in its final sorted position ${i}`,
      sortedPositions: new Set([...sortedPositions]),
    });
  }

  // Mark the last element as sorted
  sortedPositions.add(n - 1);

  steps.push({
    type: "complete",
    indices: [n - 1],
    array: [...arr],
    currentValues: [arr[n - 1]],
    message: `Array is sorted`,
    sortedPositions: sortedPositions,
  });

  // Verify all positions are marked as sorted
  if (sortedPositions.size < arr.length) {
    const finalSortedPositions = new Set();
    for (let i = 0; i < arr.length; i++) {
      finalSortedPositions.add(i);
    }

    // Update the final step with all positions marked as sorted
    steps[steps.length - 1].sortedPositions = finalSortedPositions;
  }

  return steps;
}

// Quick Sort Algorithm
function quickSort(array) {
  const arr = [...array];
  const steps = [];
  // Keep track of all positions that are in their final sorted place
  const sortedPositions = new Set();
  // Keep track of partitioned subarrays
  const partitionedRanges = [];

  function quickSortHelper(arr, low, high) {
    if (low < high) {
      // Choose pivot (last element)
      steps.push({
        type: "pivot",
        indices: [high],
        array: [...arr],
        currentValues: [arr[high]],
        message: `Choosing pivot: ${arr[high]} at index ${high}`,
        sortedPositions: new Set([...sortedPositions]),
        partitionedRanges: [...partitionedRanges],
      });

      const pivotIndex = partition(arr, low, high);

      // Mark pivot as in final position
      sortedPositions.add(pivotIndex);

      steps.push({
        type: "pivotPlaced",
        indices: [pivotIndex],
        array: [...arr],
        currentValues: [arr[pivotIndex]],
        message: `Pivot ${arr[pivotIndex]} placed at its final position ${pivotIndex}`,
        sortedPositions: new Set([...sortedPositions]),
        partitionedRanges: [...partitionedRanges],
      });

      // Add current subarrays to partitioned ranges
      if (low < pivotIndex - 1) {
        partitionedRanges.push([low, pivotIndex - 1]);
      }
      if (pivotIndex + 1 < high) {
        partitionedRanges.push([pivotIndex + 1, high]);
      }

      // Recursively sort elements before and after partition
      quickSortHelper(arr, low, pivotIndex - 1);
      quickSortHelper(arr, pivotIndex + 1, high);

      // Remove processed subarrays
      if (low < pivotIndex - 1) {
        const index = partitionedRanges.findIndex(
          (range) => range[0] === low && range[1] === pivotIndex - 1
        );
        if (index !== -1) {
          partitionedRanges.splice(index, 1);
        }
      }
      if (pivotIndex + 1 < high) {
        const index = partitionedRanges.findIndex(
          (range) => range[0] === pivotIndex + 1 && range[1] === high
        );
        if (index !== -1) {
          partitionedRanges.splice(index, 1);
        }
      }
    } else if (low === high && low >= 0) {
      // Single element is already sorted
      sortedPositions.add(low);

      steps.push({
        type: "singleElement",
        indices: [low],
        array: [...arr],
        currentValues: [arr[low]],
        message: `Single element ${arr[low]} at index ${low} is already sorted`,
        sortedPositions: new Set([...sortedPositions]),
        partitionedRanges: [...partitionedRanges],
      });
    }
  }

  function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      type: "partitionStart",
      indices: [low, high],
      array: [...arr],
      currentValues: [pivot],
      message: `Partitioning array from index ${low} to ${high} with pivot ${pivot}`,
      sortedPositions: new Set([...sortedPositions]),
      partitionedRanges: [...partitionedRanges],
    });

    for (let j = low; j < high; j++) {
      // Record comparison
      steps.push({
        type: "comparison",
        indices: [j, high],
        array: [...arr],
        currentValues: [arr[j], pivot],
        message: `Comparing ${arr[j]} with pivot value ${pivot}`,
        sortedPositions: new Set([...sortedPositions]),
        partitionedRanges: [...partitionedRanges],
      });

      if (arr[j] <= pivot) {
        i++;

        if (i !== j) {
          // Swap
          [arr[i], arr[j]] = [arr[j], arr[i]];

          // Record swap
          steps.push({
            type: "swap",
            indices: [i, j],
            array: [...arr],
            currentValues: [arr[i], arr[j]],
            message: `Moving ${arr[i]} to left partition (≤ pivot)`,
            sortedPositions: new Set([...sortedPositions]),
            partitionedRanges: [...partitionedRanges],
          });
        } else {
          // Already in position
          steps.push({
            type: "correct",
            indices: [i],
            array: [...arr],
            currentValues: [arr[i]],
            message: `${arr[i]} already in correct side of partition (≤ pivot)`,
            sortedPositions: new Set([...sortedPositions]),
            partitionedRanges: [...partitionedRanges],
          });
        }
      }
    }

    if (i + 1 !== high) {
      // Swap pivot to its final position
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

      // Record swap
      steps.push({
        type: "swap",
        indices: [i + 1, high],
        array: [...arr],
        currentValues: [arr[i + 1], arr[high]],
        message: `Placing pivot: Swapping ${arr[i + 1]} with pivot ${
          arr[high]
        }`,
        sortedPositions: new Set([...sortedPositions]),
        partitionedRanges: [...partitionedRanges],
      });
    } else {
      // Pivot already in position
      steps.push({
        type: "pivotCorrect",
        indices: [high],
        array: [...arr],
        currentValues: [arr[high]],
        message: `Pivot ${arr[high]} already in correct position`,
        sortedPositions: new Set([...sortedPositions]),
        partitionedRanges: [...partitionedRanges],
      });
    }

    return i + 1;
  }

  quickSortHelper(arr, 0, arr.length - 1);

  // Verify that all positions are marked as sorted at the end
  if (sortedPositions.size < arr.length) {
    // Make sure all positions are included in the final step
    const finalSortedPositions = new Set();
    for (let i = 0; i < arr.length; i++) {
      finalSortedPositions.add(i);
    }

    // Final step - array is fully sorted
    steps.push({
      type: "complete",
      indices: [],
      array: [...arr],
      message: "Array sorting complete",
      sortedPositions: finalSortedPositions,
      partitionedRanges: [],
    });
  } else {
    // Final step - array is fully sorted
    steps.push({
      type: "complete",
      indices: [],
      array: [...arr],
      message: "Array sorting complete",
      sortedPositions: sortedPositions,
      partitionedRanges: [],
    });
  }

  return steps;
}

// Insertion Sort Algorithm
function insertionSort(array) {
  const arr = [...array];
  const n = arr.length;
  const steps = [];
  // Track sorted positions - we build up the sorted portion from the left
  const sortedPositions = new Set();

  // First element is already sorted
  sortedPositions.add(0);
  steps.push({
    type: "initialize",
    indices: [0],
    array: [...arr],
    currentValues: [arr[0]],
    message: `Starting with first element ${arr[0]} which is already sorted`,
    sortedPositions: new Set([...sortedPositions]),
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];

    // Record current element to be inserted
    steps.push({
      type: "selectKey",
      indices: [i],
      array: [...arr],
      currentValues: [key],
      message: `Selecting element ${key} at position ${i} to insert into sorted portion`,
      sortedPositions: new Set([...sortedPositions]),
    });

    let j = i - 1;

    // Compare with elements in the sorted portion
    while (j >= 0) {
      steps.push({
        type: "comparison",
        indices: [j, i],
        array: [...arr],
        currentValues: [arr[j], key],
        message: `Comparing ${arr[j]} with key ${key}`,
        sortedPositions: new Set([...sortedPositions]),
      });

      if (arr[j] <= key) {
        // Found the right position
        break;
      }

      // Shift element to the right
      arr[j + 1] = arr[j];

      // Record shift
      steps.push({
        type: "shift",
        indices: [j, j + 1],
        array: [...arr],
        currentValues: [arr[j], arr[j + 1]],
        message: `Shifting ${arr[j]} one position to the right`,
        sortedPositions: new Set([...sortedPositions]),
      });

      j--;
    }

    // Insert element at the correct position
    arr[j + 1] = key;

    // If element was moved
    if (j + 1 !== i) {
      steps.push({
        type: "insert",
        indices: [j + 1],
        array: [...arr],
        currentValues: [key],
        message: `Inserting ${key} at position ${j + 1}`,
        sortedPositions: new Set([...sortedPositions]),
      });
    } else {
      // Element was already in the right position
      steps.push({
        type: "alreadySorted",
        indices: [i],
        array: [...arr],
        currentValues: [key],
        message: `${key} is already in the correct sorted position`,
        sortedPositions: new Set([...sortedPositions]),
      });
    }

    // Mark position as sorted
    sortedPositions.add(i);

    // Record completion of this insertion
    steps.push({
      type: "elementInserted",
      indices: [0, i],
      array: [...arr],
      message: `Elements 0 through ${i} are now sorted`,
      sortedPositions: new Set([...sortedPositions]),
    });
  }

  // Final step - array is sorted
  steps.push({
    type: "complete",
    indices: [],
    array: [...arr],
    message: "Array sorting complete",
    sortedPositions: sortedPositions,
  });

  return steps;
}

// Merge Sort Algorithm
function mergeSort(array) {
  const arr = [...array];
  const n = arr.length;
  const steps = [];
  // Track sorted positions and temporary subarrays
  const sortedPositions = new Set();
  // We'll use this to track the current merge operation for visualization
  let currentMergeDepth = 0;

  // Recursive merge sort helper function
  function mergeSortHelper(arr, start, end, depth = 0) {
    // Single element is already sorted
    if (start >= end) {
      sortedPositions.add(start);

      steps.push({
        type: "singleElement",
        indices: [start],
        array: [...arr],
        currentValues: [arr[start]],
        message: `Subarray of size 1 at index ${start} is already sorted`,
        sortedPositions: new Set([...sortedPositions]),
        mergeRanges: [[start, end, depth]],
      });

      return;
    }

    // Find the middle point to divide the array into two halves
    const mid = Math.floor((start + end) / 2);

    // Record the division of the array
    steps.push({
      type: "divide",
      indices: [start, mid, end],
      array: [...arr],
      message: `Dividing array from indices ${start} to ${end} at midpoint ${mid}`,
      sortedPositions: new Set([...sortedPositions]),
      mergeRanges: [[start, end, depth]],
    });

    // Recursively sort the first and second halves
    mergeSortHelper(arr, start, mid, depth + 1);
    mergeSortHelper(arr, mid + 1, end, depth + 1);

    // Record before merge
    steps.push({
      type: "beforeMerge",
      indices: [start, mid, end],
      array: [...arr],
      message: `Merging subarrays from indices ${start} to ${mid} and ${
        mid + 1
      } to ${end}`,
      sortedPositions: new Set([...sortedPositions]),
      mergeRanges: [[start, end, depth]],
    });

    // Merge the two halves
    merge(arr, start, mid, end, depth);

    // After merging, mark this entire range as sorted
    for (let i = start; i <= end; i++) {
      sortedPositions.add(i);
    }

    // Record after merge
    steps.push({
      type: "afterMerge",
      indices: [start, end],
      array: [...arr],
      message: `Merged subarray from indices ${start} to ${end} is now sorted`,
      sortedPositions: new Set([...sortedPositions]),
      mergeRanges: [[start, end, depth]],
    });
  }

  // Merge function
  function merge(arr, start, mid, end, depth) {
    // Create copies of the subarrays
    const leftArray = arr.slice(start, mid + 1);
    const rightArray = arr.slice(mid + 1, end + 1);

    // Record the two subarrays
    steps.push({
      type: "mergeCopy",
      indices: [start, mid, mid + 1, end],
      array: [...arr],
      message: `Copying subarrays for merge: Left [${leftArray.join(
        ", "
      )}], Right [${rightArray.join(", ")}]`,
      sortedPositions: new Set([...sortedPositions]),
      mergeRanges: [[start, end, depth]],
    });

    let leftIndex = 0;
    let rightIndex = 0;
    let mergeIndex = start;

    // Merge the subarrays back into the original array
    while (leftIndex < leftArray.length && rightIndex < rightArray.length) {
      // Compare elements from both subarrays
      steps.push({
        type: "mergeCompare",
        indices: [start + leftIndex, mid + 1 + rightIndex],
        array: [...arr],
        currentValues: [leftArray[leftIndex], rightArray[rightIndex]],
        message: `Comparing ${leftArray[leftIndex]} and ${rightArray[rightIndex]}`,
        sortedPositions: new Set([...sortedPositions]),
        mergeRanges: [[start, end, depth]],
      });

      if (leftArray[leftIndex] <= rightArray[rightIndex]) {
        // Take from left subarray
        arr[mergeIndex] = leftArray[leftIndex];

        // Record the placement
        steps.push({
          type: "mergePlacement",
          indices: [mergeIndex],
          array: [...arr],
          currentValues: [leftArray[leftIndex]],
          message: `Placing ${leftArray[leftIndex]} from left subarray at position ${mergeIndex}`,
          sortedPositions: new Set([...sortedPositions]),
          mergeRanges: [[start, end, depth]],
        });

        leftIndex++;
      } else {
        // Take from right subarray
        arr[mergeIndex] = rightArray[rightIndex];

        // Record the placement
        steps.push({
          type: "mergePlacement",
          indices: [mergeIndex],
          array: [...arr],
          currentValues: [rightArray[rightIndex]],
          message: `Placing ${rightArray[rightIndex]} from right subarray at position ${mergeIndex}`,
          sortedPositions: new Set([...sortedPositions]),
          mergeRanges: [[start, end, depth]],
        });

        rightIndex++;
      }

      mergeIndex++;
    }

    // Copy any remaining elements from the left subarray
    while (leftIndex < leftArray.length) {
      arr[mergeIndex] = leftArray[leftIndex];

      // Record the placement
      steps.push({
        type: "mergePlacement",
        indices: [mergeIndex],
        array: [...arr],
        currentValues: [leftArray[leftIndex]],
        message: `Placing remaining ${leftArray[leftIndex]} from left subarray at position ${mergeIndex}`,
        sortedPositions: new Set([...sortedPositions]),
        mergeRanges: [[start, end, depth]],
      });

      leftIndex++;
      mergeIndex++;
    }

    // Copy any remaining elements from the right subarray
    while (rightIndex < rightArray.length) {
      arr[mergeIndex] = rightArray[rightIndex];

      // Record the placement
      steps.push({
        type: "mergePlacement",
        indices: [mergeIndex],
        array: [...arr],
        currentValues: [rightArray[rightIndex]],
        message: `Placing remaining ${rightArray[rightIndex]} from right subarray at position ${mergeIndex}`,
        sortedPositions: new Set([...sortedPositions]),
        mergeRanges: [[start, end, depth]],
      });

      rightIndex++;
      mergeIndex++;
    }
  }

  // Start the merge sort process
  mergeSortHelper(arr, 0, n - 1);

  // Final step - array is fully sorted
  steps.push({
    type: "complete",
    indices: [],
    array: [...arr],
    message: "Array sorting complete",
    sortedPositions: new Set(Array.from({ length: arr.length }, (_, i) => i)),
    mergeRanges: [],
  });

  return steps;
}

// Get sorting algorithm by name
function getSortingAlgorithm(name) {
  switch (name) {
    case "bubble":
      return bubbleSort;
    case "selection":
      return selectionSort;
    case "quick":
      return quickSort;
    case "insertion":
      return insertionSort;
    case "merge":
      return mergeSort;
    default:
      return bubbleSort;
  }
}
