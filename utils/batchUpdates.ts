import {
  getValidatingBatches,
  updateBatchStatus,
  updateOutputFileId,
} from "../src/db/models/batches";
import { getBatchStatus } from "./openai";

export const fetchAndUpdateValidatingBatches = async () => {
  let batches = await getValidatingBatches();
  for (let batch of batches) {
    let b = await getBatchStatus(batch.batchid);
    await updateBatchStatus(batch.batchid, b.status);
    if (b.output_file_id) {
      await updateOutputFileId(batch.batchid, b.output_file_id);
    }
  }
};

fetchAndUpdateValidatingBatches();
