# if [ ! -d "terraform_test" ]; then exit 1; fi
resource "null_resource" "build" {
  triggers = {
    cli = <<EOT
if [ $DEPLOY_CONTRACTS == true ]; then
  echo "Deploying contracts..."
  sui client publish --gas-budget $GAS_BUDGET | tee $FILE_PATH/output.txt
else
    echo "Skipping deployment..."
fi
EOT
  script = <<EOT
echo "Deploying contracts..."
npm i -D typescript tsx @types/node touch minimist @mysten/sui.js && npx tsx scripts/deploy.ts --private_key $PRIVATE_KEY --project_name $PROJECT_NAME --module_name $MODULE_NAME
EOT
  }
  # npm i -D typescript minimist @mysten/sui.js && npm i --save-dev @types/node @types/minimist && npx ts-node scripts/deploy.ts --private_key $PRIVATE_KEY
  # npm i -D typescript && npm i -D ts-node && npm i @mysten/sui.js && npx ts-node scripts/deploy.ts

  provisioner "local-exec" {
    command = self.triggers.cli
    working_dir = var.build_dir

    environment = {
      GAS_BUDGET = var.gas_budget
      DEPLOY_CONTRACTS = var.deploy_contracts
    }
  }

  # provisioner "local-exec" {
  #   command = self.triggers.script
  #   working_dir = "${path.module}/scripts"
  #   interpreter = ["python3"]
  # }
  #
  provisioner "local-exec" {
    command = self.triggers.script
    working_dir = path.module

    environment = {
      PRIVATE_KEY = var.private_key
      PROJECT_NAME = var.project_name
      MODULE_NAME = var.module_name
    }
  }
}
