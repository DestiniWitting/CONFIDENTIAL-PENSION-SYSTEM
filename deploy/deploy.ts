import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedContract = await deploy("ConfidentialPensionSystem", {
    from: deployer,
    log: true,
  });

  console.log(`Confidential Pension System contract deployed at: `, deployedContract.address);
};
export default func;
func.id = "deploy_confidential_pension_system";
func.tags = ["ConfidentialPensionSystem"];
