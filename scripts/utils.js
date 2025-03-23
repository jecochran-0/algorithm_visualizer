// Utility functions for the Algorithm Visualizer

// Enhanced algorithm information
const algorithmInfo = {
  sorting: {
    bubble: {
      title: "Bubble Sort",
      complexity: "Time: O(n²) | Space: O(1)",
      description:
        "Repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order. Simplest sorting algorithm but inefficient for large lists. Useful for educational purposes and small datasets where simplicity is preferred over efficiency.",
    },
    selection: {
      title: "Selection Sort",
      complexity: "Time: O(n²) | Space: O(1)",
      description:
        "Finds the minimum element from the unsorted portion and places it at the beginning. Performs well on small arrays and minimizes the number of swaps. Useful when memory writes are expensive operations, as it makes only O(n) swaps.",
    },
    insertion: {
      title: "Insertion Sort",
      complexity: "Time: O(n²) | Space: O(1)",
      description:
        "Builds the sorted array one item at a time by comparing each with the already sorted portion. Efficient for small datasets and nearly-sorted data. Commonly used in hybrid sorting algorithms like Timsort. Adaptable and stable with excellent performance on partially sorted arrays.",
    },
    quick: {
      title: "Quick Sort",
      complexity: "Time: O(n log n) avg, O(n²) worst | Space: O(log n)",
      description:
        "Divides array around a pivot element, recursively sorts the sub-arrays. Very efficient in practice with excellent average-case performance. Widely used in standard library sorting functions and real-world applications requiring high performance on large datasets.",
    },
    merge: {
      title: "Merge Sort",
      complexity: "Time: O(n log n) | Space: O(n)",
      description:
        "Divides array into halves, sorts them separately, then merges them back together. Guaranteed O(n log n) performance regardless of input data. Stable sort algorithm ideal for linked lists and applications where consistent performance is critical, such as external sorting of large datasets.",
    },
  },
  pathfinding: {
    dijkstra: {
      title: "Dijkstra's Algorithm",
      complexity: "Time: O((V+E) log V) | Space: O(V)",
      description:
        "Finds the shortest path from a start node to all other nodes in a weighted graph with non-negative weights. Used in network routing protocols, GPS systems, and transportation planning. Guarantees optimal paths but can be slower than alternatives.",
    },
    astar: {
      title: "A* Algorithm",
      complexity: "Time: O(E) | Space: O(V)",
      description:
        "Uses heuristics to find the shortest path more efficiently than Dijkstra's by prioritizing paths that appear to lead closer to the goal. Widely used in games, robotics, and navigation systems where finding paths in real-time is crucial. Combines best aspects of Dijkstra's algorithm and greedy best-first search.",
    },
    bfs: {
      title: "Breadth-First Search",
      complexity: "Time: O(V+E) | Space: O(V)",
      description:
        "Explores all neighbors at the present depth before moving to nodes at the next level. Guarantees shortest path in unweighted graphs. Used in social network analysis, web crawling, and finding closest matches. Particularly useful for finding the shortest path with the fewest number of edges.",
    },
    dfs: {
      title: "Depth-First Search",
      complexity: "Time: O(V+E) | Space: O(V)",
      description:
        "Explores as far as possible along each branch before backtracking. Used in topological sorting, solving puzzles (mazes, Sudoku), cycle detection, and connected component analysis. More memory-efficient than BFS for deep graphs and excels at path finding when many solutions exist.",
    },
  },
};

// Generate random array for sorting visualization
function generateRandomArray(size) {
  const array = [];
  for (let i = 0; i < size; i++) {
    array.push(Math.floor(Math.random() * 100) + 1);
  }
  return array;
}

// Initialize grid for pathfinding visualization
function initializeGrid(size) {
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      row.push({
        x,
        y,
        isWall: false,
        isVisited: false,
        isPath: false,
        isStart: false,
        isEnd: false,
        distance: Infinity,
        f: Infinity,
        g: Infinity,
        h: Infinity,
        previousNode: null,
      });
    }
    grid.push(row);
  }
  return grid;
}

// Sets random start and end nodes for the grid
function setRandomNodes(grid, gridSize) {
  // First, ensure any existing start/end nodes are cleared
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      grid[y][x].isStart = false;
      grid[y][x].isEnd = false;
    }
  }

  // Generate random positions for start and end points
  // Make sure they are at least gridSize/3 cells apart
  let startX, startY, endX, endY;
  let minDistance = Math.floor(gridSize / 3);

  do {
    startX = Math.floor(Math.random() * gridSize);
    startY = Math.floor(Math.random() * gridSize);
    endX = Math.floor(Math.random() * gridSize);
    endY = Math.floor(Math.random() * gridSize);

    // Calculate Manhattan distance between points
    const distance = Math.abs(startX - endX) + Math.abs(startY - endY);

    // Keep generating until points are far enough apart
    if (distance >= minDistance) {
      break;
    }
  } while (true);

  // Set start and end nodes
  grid[startY][startX].isStart = true;
  grid[endY][endX].isEnd = true;

  return {
    grid,
    startNode: grid[startY][startX],
    endNode: grid[endY][endX],
  };
}

// Save preferences to localStorage
function saveToLocalStorage(preferences) {
  localStorage.setItem(
    "algorithmVisualizerPreferences",
    JSON.stringify(preferences)
  );
}

// Load preferences from localStorage
function loadFromLocalStorage() {
  const savedPreferences = localStorage.getItem(
    "algorithmVisualizerPreferences"
  );
  return savedPreferences ? JSON.parse(savedPreferences) : null;
}

// Get speed values based on slider position
function getSpeedValues(speedValue) {
  switch (parseInt(speedValue)) {
    case 1:
      return { text: "Very Slow", multiplier: 1 };
    case 2:
      return { text: "Slow", multiplier: 5 };
    case 3:
      return { text: "Normal", multiplier: 15 };
    case 4:
      return { text: "Fast", multiplier: 30 };
    case 5:
      return { text: "Very Fast", multiplier: 60 };
    default:
      return { text: "Normal", multiplier: 15 };
  }
}

// Reset grid cells (clear visited and path states)
function resetGridState(grid) {
  for (let row of grid) {
    for (let cell of row) {
      cell.isVisited = false;
      cell.isPath = false;
      cell.distance = Infinity;
      cell.f = Infinity;
      cell.g = Infinity;
      cell.h = Infinity;
      cell.previousNode = null;
    }
  }
  return grid;
}

// Create a deep copy of the grid
function cloneGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

// Find start and end nodes in grid
function findStartAndEndNodes(grid) {
  let startNode = null;
  let endNode = null;

  for (let row of grid) {
    for (let cell of row) {
      if (cell.isStart) startNode = cell;
      if (cell.isEnd) endNode = cell;
    }
  }

  return { startNode, endNode };
}
