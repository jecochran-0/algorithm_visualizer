// Pathfinding Algorithms

// Dijkstra's Algorithm
function dijkstra(grid, startNode, endNode) {
  if (!startNode || !endNode) return { visitedNodesInOrder: [], path: [] };

  // Create a deep copy of the grid to avoid modifying the original
  const gridCopy = JSON.parse(JSON.stringify(grid));
  const startNodeCopy = gridCopy[startNode.y][startNode.x];
  const endNodeCopy = gridCopy[endNode.y][endNode.x];

  // Copy over important properties
  for (let y = 0; y < gridCopy.length; y++) {
    for (let x = 0; x < gridCopy[0].length; x++) {
      gridCopy[y][x].isWall = grid[y][x].isWall;
      gridCopy[y][x].isStart = grid[y][x].isStart;
      gridCopy[y][x].isEnd = grid[y][x].isEnd;
    }
  }

  const visitedNodesInOrder = [];

  // Reset grid nodes
  for (let row of gridCopy) {
    for (let node of row) {
      node.distance = Infinity;
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  startNodeCopy.distance = 0;
  const unvisitedNodes = getAllNodes(gridCopy);

  while (unvisitedNodes.length) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();

    // If we encounter a wall, skip it
    if (closestNode.isWall) continue;

    // If the closest node is at a distance of infinity,
    // we must be trapped and should stop
    if (closestNode.distance === Infinity)
      return { visitedNodesInOrder, path: [] };

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    // If we've reached the end node, compute and return the path
    if (closestNode === endNodeCopy) {
      const path = getPathToNode(endNodeCopy);
      return { visitedNodesInOrder, path };
    }

    updateUnvisitedNeighbors(closestNode, gridCopy);
  }

  // If we get here, there was no path
  return { visitedNodesInOrder, path: [] };
}

// A* Algorithm
function astar(grid, startNode, endNode) {
  if (!startNode || !endNode) return { visitedNodesInOrder: [], path: [] };

  // Create a deep copy of the grid to avoid modifying the original
  const gridCopy = JSON.parse(JSON.stringify(grid));
  const startNodeCopy = gridCopy[startNode.y][startNode.x];
  const endNodeCopy = gridCopy[endNode.y][endNode.x];

  // Copy over important properties
  for (let y = 0; y < gridCopy.length; y++) {
    for (let x = 0; x < gridCopy[0].length; x++) {
      gridCopy[y][x].isWall = grid[y][x].isWall;
      gridCopy[y][x].isStart = grid[y][x].isStart;
      gridCopy[y][x].isEnd = grid[y][x].isEnd;
    }
  }

  const visitedNodesInOrder = [];

  // Reset grid nodes
  for (let row of gridCopy) {
    for (let node of row) {
      node.distance = Infinity;
      node.f = Infinity;
      node.g = Infinity;
      node.h = Infinity;
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  startNodeCopy.distance = 0;
  startNodeCopy.g = 0;
  startNodeCopy.h = manhattanDistance(startNodeCopy, endNodeCopy);
  startNodeCopy.f = startNodeCopy.h;

  const openSet = [startNodeCopy];

  while (openSet.length > 0) {
    // Sort by f value (lowest first)
    openSet.sort((a, b) => a.f - b.f);

    const currentNode = openSet.shift();

    // Skip walls
    if (currentNode.isWall) continue;

    // Mark as visited
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    // Check if we've reached the end
    if (currentNode === endNodeCopy) {
      const path = getPathToNode(endNodeCopy);
      return { visitedNodesInOrder, path };
    }

    // Get neighbors
    const neighbors = getNeighbors(currentNode, gridCopy);

    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue;

      // Calculate g, h, and f values
      const tentativeG = currentNode.g + 1;

      if (tentativeG < neighbor.g) {
        neighbor.previousNode = currentNode;
        neighbor.g = tentativeG;
        neighbor.h = manhattanDistance(neighbor, endNodeCopy);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.distance = neighbor.f; // For visualization

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  // If we get here, there was no path
  return { visitedNodesInOrder, path: [] };
}

// Breadth-First Search (BFS) Algorithm
function bfs(grid, startNode, endNode) {
  if (!startNode || !endNode) return { visitedNodesInOrder: [], path: [] };

  // Create a deep copy of the grid to avoid modifying the original
  const gridCopy = JSON.parse(JSON.stringify(grid));
  const startNodeCopy = gridCopy[startNode.y][startNode.x];
  const endNodeCopy = gridCopy[endNode.y][endNode.x];

  // Copy over important properties
  for (let y = 0; y < gridCopy.length; y++) {
    for (let x = 0; x < gridCopy[0].length; x++) {
      gridCopy[y][x].isWall = grid[y][x].isWall;
      gridCopy[y][x].isStart = grid[y][x].isStart;
      gridCopy[y][x].isEnd = grid[y][x].isEnd;
    }
  }

  const visitedNodesInOrder = [];

  // Reset grid nodes
  for (let row of gridCopy) {
    for (let node of row) {
      node.distance = Infinity;
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  // Initialize the queue with the start node
  const queue = [startNodeCopy];
  startNodeCopy.isVisited = true;
  startNodeCopy.distance = 0;
  visitedNodesInOrder.push(startNodeCopy);

  // BFS traversal
  while (queue.length) {
    const currentNode = queue.shift();

    // If we've reached the end node, compute and return the path
    if (currentNode === endNodeCopy) {
      const path = getPathToNode(endNodeCopy);
      return { visitedNodesInOrder, path };
    }

    // Get all neighbors
    const neighbors = getNeighbors(currentNode, gridCopy);

    // Process each neighbor
    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue;

      neighbor.isVisited = true;
      neighbor.distance = currentNode.distance + 1;
      neighbor.previousNode = currentNode;

      visitedNodesInOrder.push(neighbor);
      queue.push(neighbor);
    }
  }

  // If we get here, there was no path
  return { visitedNodesInOrder, path: [] };
}

// Depth-First Search (DFS) Algorithm - Corrected
function dfs(grid, startNode, endNode) {
  if (!startNode || !endNode) return { visitedNodesInOrder: [], path: [] };

  // Create a deep copy of the grid to avoid modifying the original
  const gridCopy = JSON.parse(JSON.stringify(grid));
  const startNodeCopy = gridCopy[startNode.y][startNode.x];
  const endNodeCopy = gridCopy[endNode.y][endNode.x];

  // Copy over important properties
  for (let y = 0; y < gridCopy.length; y++) {
    for (let x = 0; x < gridCopy[0].length; x++) {
      gridCopy[y][x].isWall = grid[y][x].isWall;
      gridCopy[y][x].isStart = grid[y][x].isStart;
      gridCopy[y][x].isEnd = grid[y][x].isEnd;
    }
  }

  const visitedNodesInOrder = [];

  // Reset grid nodes
  for (let row of gridCopy) {
    for (let node of row) {
      node.distance = Infinity;
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  // Mark start node
  startNodeCopy.distance = 0;

  // Use recursive DFS implementation
  function dfsVisit(node) {
    // Mark node as visited
    node.isVisited = true;
    visitedNodesInOrder.push(node);

    // If we found the target, stop recursion
    if (node === endNodeCopy) {
      return true;
    }

    // Get all neighbors
    const neighbors = getNeighbors(node, gridCopy);

    // Process each unvisited neighbor in DFS manner
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        neighbor.previousNode = node;
        neighbor.distance = node.distance + 1;

        // Recursive call - if it returns true, we found the target
        if (dfsVisit(neighbor)) {
          return true;
        }
      }
    }

    // If we get here, no path found from this node
    return false;
  }

  // Start DFS from the start node
  const foundTarget = dfsVisit(startNodeCopy);

  // If we found the target, construct and return the path
  if (foundTarget) {
    const path = getPathToNode(endNodeCopy);
    return { visitedNodesInOrder, path };
  }

  // If we get here, there was no path
  return { visitedNodesInOrder, path: [] };
}

// Helper Functions

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function sortNodesByDistance(nodes) {
  nodes.sort((a, b) => a.distance - b.distance);
}

function updateUnvisitedNeighbors(node, grid) {
  const neighbors = getNeighbors(node, grid);
  for (const neighbor of neighbors) {
    if (!neighbor.isVisited && !neighbor.isWall) {
      neighbor.distance = node.distance + 1;
      neighbor.previousNode = node;
    }
  }
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { x, y } = node;
  const gridSize = grid.length;

  // Up
  if (y > 0) neighbors.push(grid[y - 1][x]);
  // Right
  if (x < gridSize - 1) neighbors.push(grid[y][x + 1]);
  // Down
  if (y < gridSize - 1) neighbors.push(grid[y + 1][x]);
  // Left
  if (x > 0) neighbors.push(grid[y][x - 1]);

  return neighbors;
}

function getPathToNode(endNode) {
  const path = [];
  let currentNode = endNode;

  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  return path;
}

function manhattanDistance(nodeA, nodeB) {
  return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
}

// Get pathfinding algorithm by name
function getPathfindingAlgorithm(name) {
  switch (name) {
    case "dijkstra":
      return dijkstra;
    case "astar":
      return astar;
    case "bfs":
      return bfs;
    case "dfs":
      return dfs;
    default:
      return dijkstra;
  }
}
