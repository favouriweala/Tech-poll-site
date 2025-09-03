// Performance testing utilities for vote tallying optimizations
import { PollOption } from './types';
import { createOptimizedVoteProcessor, VoteStatsCalculator, VoteLookup } from './vote-utils';

// Generate test data for performance testing
export function generateTestPollData(optionCount: number, voteCount: number): PollOption[] {
  const options: PollOption[] = [];
  
  for (let i = 0; i < optionCount; i++) {
    const optionVotes = Math.floor(Math.random() * voteCount);
    const voters: string[] = [];
    
    // Generate unique voter IDs
    for (let j = 0; j < optionVotes; j++) {
      voters.push(`voter_${j}_${i}`);
    }
    
    options.push({
      option_id: `option_${i}`,
      option_text: `Option ${i + 1}`,
      order_index: i,
      vote_count: optionVotes,
      vote_percentage: 0,
      voters,
    });
  }
  
  return options;
}

// Original inefficient calculation (for comparison)
function calculateStatsOriginal(options: PollOption[]) {
  const start = performance.now();
  
  // Simulate original inefficient approach
  const totalVotes = options.reduce((sum, option) => sum + (option.vote_count || 0), 0);
  const maxVotes = Math.max(...options.map(option => option.vote_count || 0));
  const uniqueVoters = new Set(options.flatMap(option => option.voters || [])).size;
  
  const percentages: Record<string, number> = {};
  options.forEach(option => {
    const voteCount = option.vote_count || 0;
    percentages[option.option_id] = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  });
  
  const end = performance.now();
  
  return {
    totalVotes,
    maxVotes,
    uniqueVoters,
    percentages,
    executionTime: end - start,
  };
}

// Optimized calculation
function calculateStatsOptimized(options: PollOption[]) {
  const start = performance.now();
  
  const processor = createOptimizedVoteProcessor(options);
  const stats = processor.getStats();
  
  const end = performance.now();
  
  return {
    ...stats,
    executionTime: end - start,
  };
}

// Performance benchmark
export function runPerformanceBenchmark() {
  const testCases = [
    { options: 10, votes: 100 },
    { options: 50, votes: 1000 },
    { options: 100, votes: 5000 },
    { options: 200, votes: 10000 },
    { options: 500, votes: 50000 },
  ];
  
  console.log('🚀 Vote Tallying Performance Benchmark');
  console.log('=====================================');
  
  testCases.forEach(({ options: optionCount, votes: voteCount }) => {
    console.log(`\n📊 Test Case: ${optionCount} options, ${voteCount} votes`);
    
    // Generate test data
    const testData = generateTestPollData(optionCount, voteCount);
    
    // Run original approach multiple times for average
    const originalTimes: number[] = [];
    for (let i = 0; i < 5; i++) {
      const result = calculateStatsOriginal(testData);
      originalTimes.push(result.executionTime);
    }
    const avgOriginal = originalTimes.reduce((a, b) => a + b, 0) / originalTimes.length;
    
    // Run optimized approach multiple times for average
    const optimizedTimes: number[] = [];
    for (let i = 0; i < 5; i++) {
      const result = calculateStatsOptimized(testData);
      optimizedTimes.push(result.executionTime);
    }
    const avgOptimized = optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length;
    
    // Calculate improvement
    const improvement = ((avgOriginal - avgOptimized) / avgOriginal * 100).toFixed(1);
    const speedup = (avgOriginal / avgOptimized).toFixed(1);
    
    console.log(`   Original:  ${avgOriginal.toFixed(2)}ms`);
    console.log(`   Optimized: ${avgOptimized.toFixed(2)}ms`);
    console.log(`   🎯 Improvement: ${improvement}% faster (${speedup}x speedup)`);
  });
  
  console.log('\n✅ Benchmark Complete');
}

// Memory usage test
export function testMemoryUsage() {
  const testData = generateTestPollData(1000, 100000);
  
  console.log('🧠 Memory Usage Comparison');
  console.log('==========================');
  
  // Test original approach memory usage
  const beforeOriginal = (performance as any).memory?.usedJSHeapSize || 0;
  calculateStatsOriginal(testData);
  const afterOriginal = (performance as any).memory?.usedJSHeapSize || 0;
  const originalMemory = afterOriginal - beforeOriginal;
  
  // Clear memory
  if (global.gc) global.gc();
  
  // Test optimized approach memory usage
  const beforeOptimized = (performance as any).memory?.usedJSHeapSize || 0;
  calculateStatsOptimized(testData);
  const afterOptimized = (performance as any).memory?.usedJSHeapSize || 0;
  const optimizedMemory = afterOptimized - beforeOptimized;
  
  console.log(`Original Memory Usage:  ${(originalMemory / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Optimized Memory Usage: ${(optimizedMemory / 1024 / 1024).toFixed(2)}MB`);
  
  if (originalMemory > 0) {
    const memoryImprovement = ((originalMemory - optimizedMemory) / originalMemory * 100).toFixed(1);
    console.log(`🎯 Memory Improvement: ${memoryImprovement}%`);
  }
}

// Lookup performance test
export function testLookupPerformance() {
  const testData = generateTestPollData(1000, 10000);
  const lookup = new VoteLookup(testData);
  
  console.log('🔍 Lookup Performance Test');
  console.log('==========================');
  
  const lookupCount = 10000;
  
  // Test O(n) array lookup
  const startArray = performance.now();
  for (let i = 0; i < lookupCount; i++) {
    const optionId = `option_${i % testData.length}`;
    const option = testData.find(opt => opt.option_id === optionId);
    const voteCount = option?.vote_count || 0;
  }
  const endArray = performance.now();
  
  // Test O(1) Map lookup
  const startMap = performance.now();
  for (let i = 0; i < lookupCount; i++) {
    const optionId = `option_${i % testData.length}`;
    const voteCount = lookup.getVoteCount(optionId);
  }
  const endMap = performance.now();
  
  const arrayTime = endArray - startArray;
  const mapTime = endMap - startMap;
  const improvement = ((arrayTime - mapTime) / arrayTime * 100).toFixed(1);
  
  console.log(`Array Lookup (O(n)):  ${arrayTime.toFixed(2)}ms`);
  console.log(`Map Lookup (O(1)):    ${mapTime.toFixed(2)}ms`);
  console.log(`🎯 Lookup Improvement: ${improvement}% faster`);
}

// Run all performance tests
export function runAllPerformanceTests() {
  runPerformanceBenchmark();
  console.log('\n');
  testMemoryUsage();
  console.log('\n');
  testLookupPerformance();
}
