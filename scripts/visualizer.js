// Visualizer functions for displaying algorithms

class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStep = 0;
    this.steps = [];
    this.animationSpeed = 15; // Default normal speed
    this.animationFrameId = null;
    this.timeoutId = null;

    // Set canvas quality
    this.setupHighDpiCanvas();
  }

  // Setup high resolution canvas
  setupHighDpiCanvas() {
    // Get the device pixel ratio
    const dpr = window.devicePixelRatio || 1;

    // Get the canvas size from CSS
    const rect = this.canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Scale the context to ensure correct drawing operations
    this.ctx.scale(dpr, dpr);

    // Set the display size of the canvas
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";
  }

  // Resize canvas to fit container
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.style.width = container.clientWidth + "px";
    this.canvas.style.height = container.clientHeight + "px";

    this.canvas.width = container.clientWidth * dpr;
    this.canvas.height = container.clientHeight * dpr;

    this.ctx.scale(dpr, dpr);
  }

  // Start visualization
  play(steps) {
    this.steps = steps;
    this.currentStep = 0;
    this.isPlaying = true;
    this.isPaused = false;

    this.animate();
  }

  // Pause visualization
  pause() {
    this.isPaused = true;
    this.isPlaying = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // Continue visualization
  resume() {
    this.isPaused = false;
    this.isPlaying = true;
    this.animate();
  }

  // Move one step forward
  step() {
    if (this.currentStep < this.steps.length) {
      this.processStep(this.currentStep);
      this.currentStep++;
    }
  }

  // Stop visualization
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStep = 0;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // Animation loop
  animate() {
    if (!this.isPlaying || this.isPaused) {
      return;
    }

    if (this.currentStep >= this.steps.length) {
      this.isPlaying = false;
      return;
    }

    this.processStep(this.currentStep);
    this.currentStep++;

    // Fixed animation speed calculation
    const delay = Math.max(1, 200 / this.animationSpeed);
    this.timeoutId = setTimeout(() => {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }, delay);
  }

  // Process current step (to be implemented by subclasses)
  processStep(stepIndex) {
    console.log(`Processing step ${stepIndex}`);
  }

  // Get appropriate color based on dark/light mode
  getThemeColor(lightColor, darkColor) {
    return document.body.classList.contains("dark-mode")
      ? darkColor
      : lightColor;
  }
}

// Sorting Visualizer
class SortingVisualizer extends Visualizer {
  constructor(canvas) {
    super(canvas);
    this.array = [];
    this.comparisons = 0;
    this.swaps = 0;
    this.algorithm = "bubble"; // Default algorithm
  }

  setArray(array) {
    this.array = [...array];
    this.drawArray(this.array);
  }

  setAlgorithm(algorithm) {
    this.algorithm = algorithm;
  }

  resetStats() {
    this.comparisons = 0;
    this.swaps = 0;
  }

  // Draw array for sorting visualization with enhanced styling
  drawArray(array, highlightIndices = [], message = "") {
    const isDarkMode = document.body.classList.contains("dark-mode");
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Set background
    this.ctx.fillStyle = isDarkMode ? "#1e293b" : "#ffffff";
    this.ctx.fillRect(0, 0, width, height);

    // Draw a subtle grid pattern
    this.ctx.strokeStyle = isDarkMode
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.03)";
    this.ctx.lineWidth = 0.5;

    const gridSpacing = 20;
    for (let x = 0; x <= width; x += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Bar dimensions
    const barWidth = width / array.length;
    const heightRatio = (height - 60) / Math.max(...array, 100); // Adjusted for no legend

    // Draw message at the top with improved styling
    if (message) {
      this.ctx.fillStyle = isDarkMode ? "#f8fafc" : "#0f172a";
      this.ctx.font = "bold 16px system-ui, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.shadowColor = isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)";
      this.ctx.shadowBlur = 3;
      this.ctx.fillText(message, width / 2, 25);
      this.ctx.shadowBlur = 0;
    }

    // Get current step info for coloring
    let sortedPositions = new Set();
    let partitionedRanges = [];
    let mergeRanges = [];

    if (this.steps && this.steps.length > 0 && this.currentStep > 0) {
      const currentStepData = this.steps[this.currentStep - 1];
      if (currentStepData.sortedPositions) {
        sortedPositions = currentStepData.sortedPositions;
      }
      if (currentStepData.partitionedRanges) {
        partitionedRanges = currentStepData.partitionedRanges;
      }
      if (currentStepData.mergeRanges) {
        mergeRanges = currentStepData.mergeRanges;
      }
    }

    // Define colors (more vibrant and professional)
    const colors = {
      active: "#f72585", // Bright pink for active elements
      sorted: "#4cc9f0", // Cyan for sorted
      unsorted: "#4361ee", // Royal blue for unsorted
      partitioned: "#7209b7", // Purple for partitions
      background: isDarkMode ? "#1e293b" : "#ffffff",
    };

    // Draw bars with rounded tops and improved styling
    for (let i = 0; i < array.length; i++) {
      const barHeight = array[i] * heightRatio;

      // Determine bar color
      let color;

      if (highlightIndices.includes(i)) {
        // Current active elements
        color = colors.active;
      } else if (sortedPositions.has(i)) {
        // Elements in their final sorted position
        color = colors.sorted;
      } else {
        // Algorithm-specific coloring
        if (this.algorithm === "quick" && partitionedRanges.length > 0) {
          // Check if this index is within any of the active partition ranges
          let isInPartition = false;
          for (const [start, end] of partitionedRanges) {
            if (i >= start && i <= end) {
              isInPartition = true;
              break;
            }
          }
          // Light purple for in-progress partitions, blue for elements not yet in a partition
          color = isInPartition ? colors.partitioned : colors.unsorted;
        } else if (this.algorithm === "merge" && mergeRanges.length > 0) {
          // For merge sort, color subarrays differently based on their depth
          let currentRange = null;
          let maxDepth = 0;

          for (const [start, end, depth] of mergeRanges) {
            if (i >= start && i <= end) {
              if (!currentRange || depth > maxDepth) {
                currentRange = [start, end];
                maxDepth = depth;
              }
            }
          }

          if (currentRange) {
            // Different shades of blue based on merge depth
            const depthFactor = Math.min(0.8, maxDepth * 0.1);
            color = `rgba(67, 97, 238, ${1 - depthFactor})`;
          } else {
            color = colors.unsorted;
          }
        } else {
          // Default unsorted
          color = colors.unsorted;
        }
      }

      // Draw bar with rounded top and subtle shadow
      const x = i * barWidth;
      const y = height - barHeight - 20; // Adjusted for no legend
      const barWidthWithPadding = Math.max(1, barWidth - 1.5);

      // Add shadow effect
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      this.ctx.shadowBlur = 3;
      this.ctx.shadowOffsetY = 2;

      // Draw the bar with rounded top corners
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(x, height - 20); // Adjusted for no legend
      this.ctx.lineTo(x, y + 4);
      this.ctx.quadraticCurveTo(x, y, x + 4, y);
      this.ctx.lineTo(x + barWidthWithPadding - 4, y);
      this.ctx.quadraticCurveTo(
        x + barWidthWithPadding,
        y,
        x + barWidthWithPadding,
        y + 4
      );
      this.ctx.lineTo(x + barWidthWithPadding, height - 20); // Adjusted for no legend
      this.ctx.closePath();
      this.ctx.fill();

      // Reset shadow
      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;

      // Draw value on top of the bar if there's enough space
      if (barWidth > 20) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 10px system-ui, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(array[i].toString(), x + barWidth / 2, y - 5);
      }
    }

    // Legend removed - we're using the HTML-based legend outside the canvas
  }

  processStep(stepIndex) {
    const step = this.steps[stepIndex];
    if (!step) return;

    switch (step.type) {
      case "comparison":
      case "swap":
      case "select":
      case "updateMin":
      case "inPlace":
      case "pivot":
      case "pivotPlaced":
      case "partitionStart":
      case "correct":
      case "pivotCorrect":
      case "singleElement":
      case "complete":
      case "passComplete":
      case "elementPlaced":
      // Insertion Sort steps
      case "initialize":
      case "selectKey":
      case "shift":
      case "insert":
      case "alreadySorted":
      case "elementInserted":
      // Merge Sort steps
      case "divide":
      case "beforeMerge":
      case "afterMerge":
      case "mergeCopy":
      case "mergeCompare":
      case "mergePlacement":
        // Update counters
        if (step.type === "comparison" || step.type === "mergeCompare")
          this.comparisons++;
        if (step.type === "swap") this.swaps++;

        // Highlight relevant indices
        this.drawArray(step.array, step.indices, step.message || "");
        break;
      default:
        console.warn(`Unknown step type: ${step.type}`);
    }

    return { comparisons: this.comparisons, swaps: this.swaps };
  }
}

// Pathfinding Visualizer
class PathfindingVisualizer extends Visualizer {
  constructor(canvas) {
    super(canvas);
    this.grid = [];
    this.visitedNodes = 0;
    this.pathLength = 0;
    this.algorithm = "dijkstra"; // Default algorithm
  }

  setGrid(grid) {
    this.grid = grid;
    this.drawGrid(
      this.grid,
      null,
      "Click and drag to draw walls. Shift+Click to set start. Ctrl+Click to set end."
    );
  }

  setAlgorithm(algorithm) {
    this.algorithm = algorithm;
  }

  resetStats() {
    this.visitedNodes = 0;
    this.pathLength = 0;
  }

  // Enhanced pathfinding grid visualization
  drawGrid(grid, currentNode = null, message = "") {
    const isDarkMode = document.body.classList.contains("dark-mode");
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Set background with gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    if (isDarkMode) {
      gradient.addColorStop(0, "#1e293b");
      gradient.addColorStop(1, "#0f172a");
    } else {
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#f8fafc");
    }
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Draw message at the top with improved styling
    if (message) {
      this.ctx.fillStyle = isDarkMode ? "#f8fafc" : "#0f172a";
      this.ctx.font = "bold 16px system-ui, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.shadowColor = "rgba(0,0,0,0.2)";
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(message, width / 2, 25);
      this.ctx.shadowBlur = 0;
    }

    if (!grid || grid.length === 0) return; // Safety check

    const gridSize = grid.length;
    // Calculate cell size to ensure it's large enough to see but not too large
    const cellSize = Math.min(
      Math.floor((width - 40) / gridSize),
      Math.floor((height - 60) / gridSize) // Adjusted for no legend
    );

    // Center the grid
    const offsetX = Math.floor((width - cellSize * gridSize) / 2);
    const offsetY = 50; // Allow space for message at top

    // Draw grid background with subtle pattern
    this.ctx.fillStyle = isDarkMode ? "#0f172a" : "#f1f5f9";
    this.ctx.fillRect(
      offsetX,
      offsetY,
      cellSize * gridSize,
      cellSize * gridSize
    );

    // Add a subtle background pattern
    this.ctx.strokeStyle = isDarkMode
      ? "rgba(255,255,255,0.03)"
      : "rgba(0,0,0,0.02)";
    this.ctx.lineWidth = 0.5;

    for (let x = 0; x <= gridSize; x += 3) {
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX + x * cellSize, offsetY);
      this.ctx.lineTo(offsetX + x * cellSize, offsetY + gridSize * cellSize);
      this.ctx.stroke();
    }

    for (let y = 0; y <= gridSize; y += 3) {
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, offsetY + y * cellSize);
      this.ctx.lineTo(offsetX + gridSize * cellSize, offsetY + y * cellSize);
      this.ctx.stroke();
    }

    // Draw thin grid lines with improved styling
    this.ctx.strokeStyle = isDarkMode
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.05)";
    this.ctx.lineWidth = 0.5;

    // Draw horizontal grid lines
    for (let y = 0; y <= gridSize; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, offsetY + y * cellSize);
      this.ctx.lineTo(offsetX + gridSize * cellSize, offsetY + y * cellSize);
      this.ctx.stroke();
    }

    // Draw vertical grid lines
    for (let x = 0; x <= gridSize; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX + x * cellSize, offsetY);
      this.ctx.lineTo(offsetX + x * cellSize, offsetY + gridSize * cellSize);
      this.ctx.stroke();
    }

    // Define modern, vibrant colors
    const colors = {
      start: "#4ade80", // Green
      end: "#f43f5e", // Red
      wall: "#1e293b", // Dark blue
      visited: "#4cc9f0", // Cyan
      path: "#f59e0b", // Amber
      current: "#8b5cf6", // Purple
    };

    // Draw cells with rounded corners and shadows
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (!grid[y] || !grid[y][x]) continue; // Safety check

        const cell = grid[y][x];
        let color = null;
        let borderColor = null;

        // Only draw colored cells, not empty ones
        if (cell.isStart) {
          // Make start node more visible
          color = colors.start;
          borderColor = isDarkMode ? "#057a55" : "#059669";
        } else if (cell.isEnd) {
          // Make end node more visible
          color = colors.end;
          borderColor = isDarkMode ? "#9f1239" : "#be123c";
        } else if (cell.isPath) {
          // Make path more visible
          color = colors.path;
          borderColor = isDarkMode ? "#b45309" : "#d97706";
        } else if (cell.isVisited) {
          // Different coloring based on algorithm
          if (this.algorithm === "dfs") {
            // For DFS, use depth to determine the color intensity
            const maxDepth = 30;
            const depthFactor = Math.min(1, cell.distance / maxDepth);
            color = `rgba(76, 201, 240, ${0.4 + depthFactor * 0.6})`; // Brighter blue
          } else {
            // For other algorithms, use blue gradient based on distance
            const maxDist = 30;
            const distRatio = Math.min(1, cell.distance / maxDist);
            color = `rgba(76, 201, 240, ${0.4 + (1 - distRatio) * 0.6})`;
          }
        } else if (cell.isWall) {
          color = isDarkMode ? colors.wall : "#334155"; // Dark blue/slate
          borderColor = isDarkMode ? "#0f172a" : "#1e293b"; // Darker blue
        }

        // Highlight current node being processed
        if (currentNode && currentNode.x === x && currentNode.y === y) {
          this.ctx.shadowColor = colors.current;
          this.ctx.shadowBlur = 10;
          borderColor = colors.current; // Purple highlight
          // Make the current node border thicker
          this.ctx.strokeStyle = borderColor;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(
            offsetX + x * cellSize + 1,
            offsetY + y * cellSize + 1,
            cellSize - 2,
            cellSize - 2
          );
          this.ctx.shadowBlur = 0;
        }

        // Fill cell if it has a color
        if (color) {
          // Add a subtle shadow effect
          if (cell.isStart || cell.isEnd || cell.isPath) {
            this.ctx.shadowColor = "rgba(0,0,0,0.2)";
            this.ctx.shadowBlur = 5;
          }

          // Draw rounded rectangle for cells
          const cornerRadius = cellSize > 15 ? 3 : 0; // Only round if cells are large enough
          this.ctx.fillStyle = color;

          this.ctx.beginPath();
          this.ctx.moveTo(
            offsetX + x * cellSize + cornerRadius,
            offsetY + y * cellSize
          );
          this.ctx.lineTo(
            offsetX + (x + 1) * cellSize - cornerRadius,
            offsetY + y * cellSize
          );
          this.ctx.quadraticCurveTo(
            offsetX + (x + 1) * cellSize,
            offsetY + y * cellSize,
            offsetX + (x + 1) * cellSize,
            offsetY + y * cellSize + cornerRadius
          );
          this.ctx.lineTo(
            offsetX + (x + 1) * cellSize,
            offsetY + (y + 1) * cellSize - cornerRadius
          );
          this.ctx.quadraticCurveTo(
            offsetX + (x + 1) * cellSize,
            offsetY + (y + 1) * cellSize,
            offsetX + (x + 1) * cellSize - cornerRadius,
            offsetY + (y + 1) * cellSize
          );
          this.ctx.lineTo(
            offsetX + x * cellSize + cornerRadius,
            offsetY + (y + 1) * cellSize
          );
          this.ctx.quadraticCurveTo(
            offsetX + x * cellSize,
            offsetY + (y + 1) * cellSize,
            offsetX + x * cellSize,
            offsetY + (y + 1) * cellSize - cornerRadius
          );
          this.ctx.lineTo(
            offsetX + x * cellSize,
            offsetY + y * cellSize + cornerRadius
          );
          this.ctx.quadraticCurveTo(
            offsetX + x * cellSize,
            offsetY + y * cellSize,
            offsetX + x * cellSize + cornerRadius,
            offsetY + y * cellSize
          );
          this.ctx.closePath();
          this.ctx.fill();

          // Reset shadow
          this.ctx.shadowBlur = 0;

          // Add border if specified
          if (borderColor && currentNode?.x !== x && currentNode?.y !== y) {
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 1;
            this.ctx.stroke(); // Stroke the current path (the rounded rectangle)
          }
        }

        // Add labels for start and end with improved styling
        if (cell.isStart || cell.isEnd) {
          const fontSize = Math.max(12, Math.min(16, cellSize / 2));
          this.ctx.fillStyle = "#ffffff";
          this.ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";

          // Add text shadow for better visibility
          this.ctx.shadowColor = "rgba(0,0,0,0.5)";
          this.ctx.shadowBlur = 3;

          this.ctx.fillText(
            cell.isStart ? "S" : "E",
            offsetX + x * cellSize + cellSize / 2,
            offsetY + y * cellSize + cellSize / 2
          );

          this.ctx.shadowBlur = 0;
        }

        // Show distance/depth for visited nodes if cells are large enough
        if (
          cellSize > 20 &&
          cell.isVisited &&
          !cell.isStart &&
          !cell.isEnd &&
          !cell.isWall &&
          !cell.isPath
        ) {
          const fontSize = Math.max(10, cellSize / 3.5);
          this.ctx.fillStyle = isDarkMode ? "#ffffff" : "#1e293b";
          this.ctx.font = `${fontSize}px system-ui, sans-serif`;
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";

          // For A* show f value
          if (typeof cell.f !== "undefined" && cell.f !== Infinity) {
            this.ctx.fillText(
              cell.f.toString(),
              offsetX + x * cellSize + cellSize / 2,
              offsetY + y * cellSize + cellSize / 2
            );
          } else {
            this.ctx.fillText(
              cell.distance === Infinity ? "∞" : cell.distance.toString(),
              offsetX + x * cellSize + cellSize / 2,
              offsetY + y * cellSize + cellSize / 2
            );
          }
        }
      }
    }

    // Legend removed - we're using the HTML-based legend outside the canvas
  }

  processStep(stepIndex) {
    if (this.steps && this.steps.visitedNodesInOrder && this.steps.path) {
      // For pathfinding, steps is an object with visitedNodesInOrder and path
      const visitedNodesInOrder = this.steps.visitedNodesInOrder;
      const path = this.steps.path;

      // Visualize nodes being visited
      if (stepIndex < visitedNodesInOrder.length) {
        const node = visitedNodesInOrder[stepIndex];
        node.isVisited = true;
        this.visitedNodes++;

        // Create message about current operation
        let message;
        if (node.isStart) {
          message = "Starting from source node";
        } else if (node.isEnd) {
          message = "Destination reached!";
        } else {
          // Algorithm-specific messages
          if (this.algorithm === "dfs") {
            message = `Exploring node (${node.x},${node.y}) - depth: ${node.distance}`;
          } else if (this.algorithm === "bfs") {
            message = `Exploring node (${node.x},${node.y}) - level: ${node.distance}`;
          } else if (
            this.algorithm === "astar" &&
            typeof node.f !== "undefined"
          ) {
            message = `Visiting node (${node.x},${node.y}) - g=${node.g} h=${node.h} f=${node.f}`;
          } else {
            // Default for Dijkstra and others
            message = `Visiting node (${node.x},${node.y}) with distance ${node.distance} from start`;
          }
        }

        this.drawGrid(this.grid, node, message);
      }
      // After all nodes are visited, visualize the path
      else if (stepIndex - visitedNodesInOrder.length < path.length) {
        const pathIndex = stepIndex - visitedNodesInOrder.length;
        const node = path[pathIndex];
        node.isPath = true;
        this.pathLength++;

        const message =
          pathIndex === 0
            ? "Building path from destination to source"
            : `Building path - step ${pathIndex + 1} of ${path.length}`;

        this.drawGrid(this.grid, node, message);
      }

      return { visitedNodes: this.visitedNodes, pathLength: this.pathLength };
    }
  }
}
