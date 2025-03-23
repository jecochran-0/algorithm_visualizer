// Main application logic for the Algorithm Visualizer

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const canvas = document.getElementById("canvas");
  const algorithmType = document.getElementById("algorithmType");
  const sortingAlgorithms = document.getElementById("sortingAlgorithms");
  const pathfindingAlgorithms = document.getElementById(
    "pathfindingAlgorithms"
  );
  const sortingCustomization = document.getElementById("sortingCustomization");
  const pathfindingCustomization = document.getElementById(
    "pathfindingCustomization"
  );
  const sortingAlgorithm = document.getElementById("sortingAlgorithm");
  const pathfindingAlgorithm = document.getElementById("pathfindingAlgorithm");
  const arraySize = document.getElementById("arraySize");
  const arraySizeValue = document.getElementById("arraySizeValue");
  const gridSize = document.getElementById("gridSize");
  const gridSizeValue = document.getElementById("gridSizeValue");
  const speed = document.getElementById("speed");
  const speedValue = document.getElementById("speedValue");
  const algorithmTitle = document.getElementById("algorithmTitle");
  const complexity = document.getElementById("complexity");
  const description = document.getElementById("description");
  const stat1 = document.getElementById("stat1");
  const stat2 = document.getElementById("stat2");
  const playBtn = document.getElementById("playBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const stepBtn = document.getElementById("stepBtn");
  const resetBtn = document.getElementById("resetBtn");
  const modeToggle = document.getElementById("modeToggle");

  // State variables
  let currentAlgorithmType = "sorting";
  let array = [];
  let grid = [];
  let startNode = null;
  let endNode = null;
  let sortingVisualizer;
  let pathfindingVisualizer;
  let currentVisualizer;
  let isDrawingWall = false;
  let currentGridSize = 15;

  // Initialize
  function init() {
    // Create visualizers
    sortingVisualizer = new SortingVisualizer(canvas);
    pathfindingVisualizer = new PathfindingVisualizer(canvas);

    // Set initial visualizer based on default algorithm type
    currentVisualizer =
      currentAlgorithmType === "sorting"
        ? sortingVisualizer
        : pathfindingVisualizer;

    // Set up event listeners
    setupEventListeners();

    // Load saved preferences
    loadPreferences();

    // Generate initial data
    generateData();

    // Update algorithm info
    updateAlgorithmInfo();

    // Set up DOM references for modern layout
    updateDOMReferences();

    // Update algorithm labels for modern layout
    updateAlgorithmLabels();

    // Handle window resize
    window.addEventListener("resize", () => {
      currentVisualizer.resizeCanvas();
      if (currentAlgorithmType === "sorting") {
        sortingVisualizer.drawArray(array);
      } else {
        pathfindingVisualizer.drawGrid(grid);
      }
    });

    // Ensure canvas is properly sized
    currentVisualizer.resizeCanvas();

    // Force initial draw to ensure visualization is visible
    if (currentAlgorithmType === "sorting") {
      sortingVisualizer.drawArray(array);
    } else {
      pathfindingVisualizer.drawGrid(grid);
    }
  }

  // Update DOM references for modern layout
  function updateDOMReferences() {
    // Replace the original updateStats function with one that works with both layouts
    window.updateStats = function () {
      if (currentAlgorithmType === "sorting") {
        const compareSpan = document.querySelector("#stat1 .stat-value");
        if (compareSpan) {
          compareSpan.textContent = sortingVisualizer.comparisons;
          document.querySelector("#stat2 .stat-value").textContent =
            sortingVisualizer.swaps;
        } else {
          // Fallback to old structure if new elements not found
          stat1.textContent = `Comparisons: ${sortingVisualizer.comparisons}`;
          stat2.textContent = `Swaps: ${sortingVisualizer.swaps}`;
        }
      } else {
        const visitedSpan = document.querySelector("#stat1 .stat-value");
        if (visitedSpan) {
          visitedSpan.textContent = pathfindingVisualizer.visitedNodes;
          document.querySelector("#stat2 .stat-value").textContent =
            pathfindingVisualizer.pathLength;
        } else {
          // Fallback to old structure if new elements not found
          stat1.textContent = `Visited Nodes: ${pathfindingVisualizer.visitedNodes}`;
          stat2.textContent = `Path Length: ${pathfindingVisualizer.pathLength}`;
        }
      }
    };
  }

  // Update algorithm labels for modern layout
  function updateAlgorithmLabels() {
    if (currentAlgorithmType === "sorting") {
      const statLabels = document.querySelectorAll(".stat-item");
      if (statLabels && statLabels.length >= 2) {
        statLabels[0].innerHTML =
          'Comparisons: <span class="stat-value">0</span>';
        statLabels[1].innerHTML = 'Swaps: <span class="stat-value">0</span>';
      }
    } else {
      const statLabels = document.querySelectorAll(".stat-item");
      if (statLabels && statLabels.length >= 2) {
        statLabels[0].innerHTML =
          'Visited Nodes: <span class="stat-value">0</span>';
        statLabels[1].innerHTML =
          'Path Length: <span class="stat-value">0</span>';
      }
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    // Algorithm type change
    algorithmType.addEventListener("change", () => {
      currentAlgorithmType = algorithmType.value;
      sortingAlgorithms.style.display =
        currentAlgorithmType === "sorting" ? "block" : "none";
      pathfindingAlgorithms.style.display =
        currentAlgorithmType === "sorting" ? "none" : "block";
      sortingCustomization.style.display =
        currentAlgorithmType === "sorting" ? "block" : "none";
      pathfindingCustomization.style.display =
        currentAlgorithmType === "sorting" ? "none" : "block";

      // Switch current visualizer
      currentVisualizer =
        currentAlgorithmType === "sorting"
          ? sortingVisualizer
          : pathfindingVisualizer;

      // Generate completely new data when switching algorithm types
      generateData();
      updateAlgorithmInfo();
      updateAlgorithmLabels();

      // Save preferences
      savePreferences();
    });

    // Algorithm selection change
    sortingAlgorithm.addEventListener("change", () => {
      sortingVisualizer.setAlgorithm(sortingAlgorithm.value);
      updateAlgorithmInfo();
      savePreferences();
      // Redraw the array in case it's needed
      sortingVisualizer.drawArray(array);
    });

    pathfindingAlgorithm.addEventListener("change", () => {
      pathfindingVisualizer.setAlgorithm(pathfindingAlgorithm.value);
      updateAlgorithmInfo();

      // Reset the grid when switching algorithms to ensure a fresh start
      generateGridData();
      savePreferences();
    });

    // Customization controls
    arraySize.addEventListener("input", () => {
      arraySizeValue.textContent = arraySize.value;
      generateRandomArrayData();
      savePreferences();
    });

    gridSize.addEventListener("input", () => {
      currentGridSize = parseInt(gridSize.value);
      gridSizeValue.textContent = `${currentGridSize} x ${currentGridSize}`;
      generateGridData();
      savePreferences();
    });

    speed.addEventListener("input", () => {
      const speedVal = getSpeedValues(speed.value);
      speedValue.textContent = speedVal.text;

      // Update animation speed for current visualizer if it's already running
      if (currentVisualizer && currentVisualizer.isPlaying) {
        currentVisualizer.animationSpeed = speedVal.multiplier;
      }

      savePreferences();
    });

    // Control buttons
    playBtn.addEventListener("click", play);
    pauseBtn.addEventListener("click", pause);
    stepBtn.addEventListener("click", step);
    resetBtn.addEventListener("click", reset);

    // Mode toggle
    modeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      // Update mode toggle icon text if it exists
      const modeIcon = modeToggle.querySelector(".mode-icon");
      if (modeIcon) {
        modeIcon.textContent = document.body.classList.contains("dark-mode")
          ? "☀️"
          : "🌙";
      } else {
        // Fallback for old layout
        modeToggle.textContent = document.body.classList.contains("dark-mode")
          ? "☀️"
          : "🌙";
      }

      // Redraw the current visualization to update colors
      if (currentAlgorithmType === "sorting") {
        sortingVisualizer.drawArray(array);
      } else {
        pathfindingVisualizer.drawGrid(grid);
      }

      savePreferences();
    });

    // Canvas interactions for pathfinding
    canvas.addEventListener("mousedown", handleCanvasMouseDown);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    canvas.addEventListener("mouseup", () => {
      isDrawingWall = false;
    });
    canvas.addEventListener("mouseleave", () => {
      isDrawingWall = false;
    });
  }

  // Generate data based on current algorithm type
  function generateData() {
    if (currentAlgorithmType === "sorting") {
      generateRandomArrayData();
    } else {
      generateGridData();
    }
  }

  // Generate random array for sorting
  function generateRandomArrayData() {
    array = generateRandomArray(parseInt(arraySize.value));
    sortingVisualizer.setArray(array);
    sortingVisualizer.resetStats();
    sortingVisualizer.setAlgorithm(sortingAlgorithm.value);
    updateStats();
  }

  // Generate grid for pathfinding
  function generateGridData() {
    // Create a new grid (not reusing the old one)
    grid = initializeGrid(currentGridSize);

    // Set random start and end nodes
    const result = setRandomNodes(grid, currentGridSize);
    grid = result.grid;
    startNode = result.startNode;
    endNode = result.endNode;

    // Pass the algorithm type to the visualizer
    pathfindingVisualizer.setAlgorithm(pathfindingAlgorithm.value);

    // Update the grid in the visualizer
    pathfindingVisualizer.setGrid(grid);
    pathfindingVisualizer.grid = grid;
    pathfindingVisualizer.resetStats();
    updateStats();
  }

  // Handle canvas mouse down for pathfinding
  function handleCanvasMouseDown(e) {
    if (currentAlgorithmType !== "pathfinding" || currentVisualizer.isPlaying)
      return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // Account for grid centering and padding
    const gridSize = grid.length;
    const cellSize = Math.min(
      Math.floor((canvas.width - 40) / gridSize),
      Math.floor((canvas.height - 80) / gridSize)
    );
    const offsetX = Math.floor((canvas.width - cellSize * gridSize) / 2);
    const offsetY = 40; // Top margin

    // Calculate grid coordinates
    const x = Math.floor((canvasX - offsetX) / cellSize);
    const y = Math.floor((canvasY - offsetY) / cellSize);

    // Check if click is within grid bounds
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      if (e.shiftKey) {
        // Set start node
        if (startNode) {
          startNode.isStart = false;
        }
        grid[y][x].isStart = true;
        startNode = grid[y][x];
      } else if (e.ctrlKey) {
        // Set end node
        if (endNode) {
          endNode.isEnd = false;
        }
        grid[y][x].isEnd = true;
        endNode = grid[y][x];
      } else {
        // Toggle wall
        if (!grid[y][x].isStart && !grid[y][x].isEnd) {
          grid[y][x].isWall = !grid[y][x].isWall;
          isDrawingWall = true;
        }
      }
      pathfindingVisualizer.drawGrid(grid);
    }
  }

  // Handle canvas mouse move for pathfinding
  function handleCanvasMouseMove(e) {
    if (
      !isDrawingWall ||
      currentAlgorithmType !== "pathfinding" ||
      currentVisualizer.isPlaying
    )
      return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // Account for grid centering and padding
    const gridSize = grid.length;
    const cellSize = Math.min(
      Math.floor((canvas.width - 40) / gridSize),
      Math.floor((canvas.height - 80) / gridSize)
    );
    const offsetX = Math.floor((canvas.width - cellSize * gridSize) / 2);
    const offsetY = 40; // Top margin

    // Calculate grid coordinates
    const x = Math.floor((canvasX - offsetX) / cellSize);
    const y = Math.floor((canvasY - offsetY) / cellSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      if (!grid[y][x].isStart && !grid[y][x].isEnd && !grid[y][x].isWall) {
        grid[y][x].isWall = true;
        pathfindingVisualizer.drawGrid(grid);
      }
    }
  }

  // Add this code near the beginning of your main.js file
  // or inside your DOMContentLoaded event handler

  // Function to update the legend based on algorithm type
  function updateLegendForAlgorithmType(type) {
    const legend = document.getElementById("legend");
    if (!legend) return;

    if (type === "sorting") {
      legend.innerHTML = `
      <div class="legend-item"><div class="legend-color" style="background-color: #f72585;"></div>Active</div>
      <div class="legend-item"><div class="legend-color" style="background-color: #4cc9f0;"></div>Sorted</div>
      <div class="legend-item"><div class="legend-color" style="background-color: #4361ee;"></div>Unsorted</div>
    `;

      // Add algorithm-specific legend items if needed
      if (sortingAlgorithm.value === "quick") {
        legend.innerHTML += `<div class="legend-item"><div class="legend-color" style="background-color: #7209b7;"></div>Partition</div>`;
      } else if (sortingAlgorithm.value === "merge") {
        legend.innerHTML += `<div class="legend-item"><div class="legend-color" style="background-color: rgba(67, 97, 238, 0.5);"></div>Subarray</div>`;
      }
    } else {
      legend.innerHTML = `
      <div class="legend-item"><div class="legend-color" style="background-color: #4ade80;"></div>Start</div>
      <div class="legend-item"><div class="legend-color" style="background-color: #f72585;"></div>End</div>
      <div class="legend-item"><div class="legend-color" style="background-color: #1e293b;"></div>Wall</div>
      <div class="legend-item"><div class="legend-color" style="background-color: #4cc9f0;"></div>Visited</div>
      <div class="legend-item"><div class="legend-color" style="background-color: #f59e0b;"></div>Path</div>
    `;
    }
  }

  // Call this when the algorithm type changes
  algorithmType.addEventListener("change", () => {
    // Your existing code...

    // Add this line to update the legend
    updateLegendForAlgorithmType(algorithmType.value);

    // Rest of your existing code...
  });

  // Also update when sorting algorithm changes
  sortingAlgorithm.addEventListener("change", () => {
    // Your existing code...

    // Add this line to update the legend for sorting algorithms
    if (currentAlgorithmType === "sorting") {
      updateLegendForAlgorithmType("sorting");
    }

    // Rest of your existing code...
  });

  // Initial setup
  updateLegendForAlgorithmType(algorithmType.value);

  // Update algorithm information display
  function updateAlgorithmInfo() {
    let info;

    if (currentAlgorithmType === "sorting") {
      info = algorithmInfo.sorting[sortingAlgorithm.value];

      // For both old and new layouts
      updateStats();
    } else {
      info = algorithmInfo.pathfinding[pathfindingAlgorithm.value];

      // For both old and new layouts
      updateStats();
    }

    algorithmTitle.textContent = info.title;
    complexity.textContent = info.complexity;
    description.textContent = info.description;
  }

  // Update statistics display
  function updateStats() {
    if (currentAlgorithmType === "sorting") {
      // For modern layout
      const compareSpan = document.querySelector("#stat1 .stat-value");
      if (compareSpan) {
        compareSpan.textContent = sortingVisualizer.comparisons;
        document.querySelector("#stat2 .stat-value").textContent =
          sortingVisualizer.swaps;
      } else {
        // For original layout
        stat1.textContent = `Comparisons: ${sortingVisualizer.comparisons}`;
        stat2.textContent = `Swaps: ${sortingVisualizer.swaps}`;
      }
    } else {
      // For modern layout
      const visitedSpan = document.querySelector("#stat1 .stat-value");
      if (visitedSpan) {
        visitedSpan.textContent = pathfindingVisualizer.visitedNodes;
        document.querySelector("#stat2 .stat-value").textContent =
          pathfindingVisualizer.pathLength;
      } else {
        // For original layout
        stat1.textContent = `Visited Nodes: ${pathfindingVisualizer.visitedNodes}`;
        stat2.textContent = `Path Length: ${pathfindingVisualizer.pathLength}`;
      }
    }
  }

  // Play algorithm visualization
  function play() {
    if (currentVisualizer.isPlaying) return;

    // If paused, resume
    if (currentVisualizer.isPaused) {
      currentVisualizer.resume();
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      stepBtn.disabled = true;
      return;
    }

    // Otherwise, start from beginning
    let steps;

    if (currentAlgorithmType === "sorting") {
      // Set current algorithm in visualizer
      sortingVisualizer.setAlgorithm(sortingAlgorithm.value);

      // Get the appropriate sorting algorithm
      const sortingFunction = getSortingAlgorithm(sortingAlgorithm.value);
      steps = sortingFunction(array);
      sortingVisualizer.resetStats();
    } else {
      // For pathfinding, reset the visualization state but keep walls
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
          if (!grid[y][x].isStart && !grid[y][x].isEnd && !grid[y][x].isWall) {
            grid[y][x].isVisited = false;
            grid[y][x].isPath = false;
          }
        }
      }
      pathfindingVisualizer.setGrid(grid);

      // Get the appropriate pathfinding algorithm
      const pathfindingFunction = getPathfindingAlgorithm(
        pathfindingAlgorithm.value
      );
      const { startNode, endNode } = findStartAndEndNodes(grid);

      // Make sure we have start and end nodes
      if (!startNode || !endNode) {
        alert(
          "Please set both start and end points before running the algorithm."
        );
        return;
      }

      steps = pathfindingFunction(grid, startNode, endNode);
      pathfindingVisualizer.resetStats();
      pathfindingVisualizer.grid = grid; // Store grid reference for visualization
    }

    const speedVal = getSpeedValues(speed.value);
    currentVisualizer.animationSpeed = speedVal.multiplier;
    currentVisualizer.play(steps);

    // Update UI
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    stepBtn.disabled = true;

    // Set up an interval to update statistics during animation
    const statsInterval = setInterval(() => {
      updateStats();

      // Check if visualization has completed
      if (!currentVisualizer.isPlaying) {
        clearInterval(statsInterval);
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        stepBtn.disabled = false;
      }
    }, 100);
  }

  // Pause algorithm visualization
  function pause() {
    if (!currentVisualizer.isPlaying || currentVisualizer.isPaused) return;

    currentVisualizer.pause();

    // Update UI
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stepBtn.disabled = false;
  }

  // Step through algorithm visualization
  function step() {
    if (currentVisualizer.isPlaying && !currentVisualizer.isPaused) return;

    // If we haven't started, initialize steps
    if (currentVisualizer.currentStep === 0) {
      let steps;

      if (currentAlgorithmType === "sorting") {
        // Set current algorithm in visualizer
        sortingVisualizer.setAlgorithm(sortingAlgorithm.value);

        const sortingFunction = getSortingAlgorithm(sortingAlgorithm.value);
        steps = sortingFunction(array);
        sortingVisualizer.resetStats();
      } else {
        // For pathfinding, reset the visualization state but keep walls
        for (let y = 0; y < grid.length; y++) {
          for (let x = 0; x < grid[0].length; x++) {
            if (
              !grid[y][x].isStart &&
              !grid[y][x].isEnd &&
              !grid[y][x].isWall
            ) {
              grid[y][x].isVisited = false;
              grid[y][x].isPath = false;
            }
          }
        }
        pathfindingVisualizer.setGrid(grid);

        const pathfindingFunction = getPathfindingAlgorithm(
          pathfindingAlgorithm.value
        );
        const { startNode, endNode } = findStartAndEndNodes(grid);

        // Make sure we have start and end nodes
        if (!startNode || !endNode) {
          alert(
            "Please set both start and end points before running the algorithm."
          );
          return;
        }

        steps = pathfindingFunction(grid, startNode, endNode);
        pathfindingVisualizer.resetStats();
        pathfindingVisualizer.grid = grid; // Store grid reference for visualization
      }

      const speedVal = getSpeedValues(speed.value);
      currentVisualizer.animationSpeed = speedVal.multiplier;
      currentVisualizer.steps = steps;
    }

    // Take one step
    currentVisualizer.step();
    updateStats();

    // Check if we've reached the end
    if (currentVisualizer.currentStep >= currentVisualizer.steps.length) {
      // If it's pathfinding and we need to visualize path after nodes
      if (
        currentAlgorithmType === "pathfinding" &&
        currentVisualizer.currentStep <
          currentVisualizer.steps.visitedNodesInOrder.length +
            currentVisualizer.steps.path.length
      ) {
        // Still have path to visualize
      } else {
        // We're done
        currentVisualizer.currentStep = 0;
      }
    }
  }

  // Reset visualization
  function reset() {
    currentVisualizer.stop();

    if (currentAlgorithmType === "sorting") {
      generateRandomArrayData();
    } else {
      // For pathfinding, create a completely new grid to ensure clean state
      generateGridData();
    }

    // Update UI
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stepBtn.disabled = false;
    updateStats();
  }

  // Save preferences to localStorage
  function savePreferences() {
    const preferences = {
      algorithmType: currentAlgorithmType,
      sortingAlgorithm: sortingAlgorithm.value,
      pathfindingAlgorithm: pathfindingAlgorithm.value,
      arraySize: arraySize.value,
      gridSize: gridSize.value,
      speed: speed.value,
      darkMode: document.body.classList.contains("dark-mode"),
    };

    saveToLocalStorage(preferences);
  }

  // Load preferences from localStorage
  function loadPreferences() {
    const preferences = loadFromLocalStorage();

    if (preferences) {
      // Set algorithm type
      algorithmType.value = preferences.algorithmType || "sorting";
      currentAlgorithmType = algorithmType.value;
      sortingAlgorithms.style.display =
        currentAlgorithmType === "sorting" ? "block" : "none";
      pathfindingAlgorithms.style.display =
        currentAlgorithmType === "sorting" ? "none" : "block";
      sortingCustomization.style.display =
        currentAlgorithmType === "sorting" ? "block" : "none";
      pathfindingCustomization.style.display =
        currentAlgorithmType === "sorting" ? "none" : "block";

      // Set current visualizer
      currentVisualizer =
        currentAlgorithmType === "sorting"
          ? sortingVisualizer
          : pathfindingVisualizer;

      // Set algorithm values
      sortingAlgorithm.value = preferences.sortingAlgorithm || "bubble";
      pathfindingAlgorithm.value =
        preferences.pathfindingAlgorithm || "dijkstra";

      // Make sure to set the algorithm in the visualizer
      sortingVisualizer.setAlgorithm(sortingAlgorithm.value);
      pathfindingVisualizer.setAlgorithm(pathfindingAlgorithm.value);

      // Set size values
      arraySize.value = preferences.arraySize || 50;
      arraySizeValue.textContent = arraySize.value;

      gridSize.value = preferences.gridSize || 15;
      currentGridSize = parseInt(gridSize.value);
      gridSizeValue.textContent = `${currentGridSize} x ${currentGridSize}`;

      // Set speed
      speed.value = preferences.speed || 3;
      const speedVal = getSpeedValues(speed.value);
      speedValue.textContent = speedVal.text;

      // Set theme
      if (preferences.darkMode) {
        document.body.classList.add("dark-mode");

        // Check if using modern layout
        const modeIcon = modeToggle.querySelector(".mode-icon");
        if (modeIcon) {
          modeIcon.textContent = "☀️";
        } else {
          // Fallback for old layout
          modeToggle.textContent = "☀️";
        }
      }
    }
  }

  // Initialize the application
  init();
});
