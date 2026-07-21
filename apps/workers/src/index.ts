import { jobQueue } from './queue';
import { handlePageAnalysis } from './handlers/analysis.handler';
import { handleReportGeneration } from './handlers/report.handler';
import { handleNotificationSend, handleBulkNotificationSend } from './handlers/notification.handler';
import { handleBillingUsage, handleBillingInvoice } from './handlers/billing.handler';
import { logger } from '@lade/config';

// Register all job handlers
jobQueue.register('page:analyze', 5, handlePageAnalysis);
jobQueue.register('report:generate', 2, handleReportGeneration);
jobQueue.register('notification:send', 10, handleNotificationSend);
jobQueue.register('billing:usage', 10, handleBillingUsage);
jobQueue.register('billing:invoice', 2, handleBillingInvoice);

// Start processing
jobQueue.start();

// Handle shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down workers...');
  jobQueue.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down workers...');
  jobQueue.stop();
  process.exit(0);
});

// Report stats periodically
setInterval(() => {
  const stats = jobQueue.getStats();
  logger.info('Worker stats', stats);
}, 60000);

logger.info('Worker service started');
