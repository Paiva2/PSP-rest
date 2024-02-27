import { CronJob } from "cron";
import TransactionFactory from "../controllers/transactions/factory";

interface ICronTasks {
  time: string;
  exec: () => void;
  onComplete: () => void;
}

const midnight = "0 0 * * *";

export const cronTasks: ICronTasks[] = [
  {
    time: midnight,
    exec: async () => {
      const walletRepository = new TransactionFactory();

      const { waitingFundsTransactionService } = await walletRepository.exec();

      await waitingFundsTransactionService.exec();
    },
    onComplete: () => {
      return console.log("Daily task done. Transactions waiting for funds handled.")
    },
  },
];

function handleTasks() {
  cronTasks.forEach((task) => {
    new CronJob(
      task.time,
      () => task.exec(),
      task.onComplete,
      true,
      "Europe/London"
    );
  });
}

export default handleTasks;
