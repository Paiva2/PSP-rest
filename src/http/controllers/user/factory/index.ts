import PayableModel from "../../../database/PayableModel";
import UserModel from "../../../database/UserModel";
import WalletModel from "../../../database/WalletModel";
import CheckOwnWalletService from "../../../services/user/checkOwnWalletService";
import UserAuthService from "../../../services/user/userAuthService";
import { UserCreationService } from "../../../services/user/userCreationService";

export default class UserFactory {
  constructor() {}

  public async exec() {
    const models = this.models();

    const userCreationService = new UserCreationService(
      models.userModel,
      models.walletModel
    );
    const userAuthService = new UserAuthService(models.userModel);

    const checkOwnWalletService = new CheckOwnWalletService(
      models.userModel,
      models.payableRepository
    );

    return {
      userCreationService,
      userAuthService,
      checkOwnWalletService,
    };
  }

  private models() {
    const userModel = new UserModel();
    const walletModel = new WalletModel();
    const payableRepository = new PayableModel();

    return {
      userModel,
      walletModel,
      payableRepository,
    };
  }
}
