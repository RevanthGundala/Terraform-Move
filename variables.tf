variable "project_name" {
    description = "Name of the project"
    type = string
    default = ""
}

variable "build_dir" {
    description = "Build directory of contracts"
    type = string
    default = ""
}

variable "gas_budget" {
    description = "Gas budget for deployment"
    type = number
    default = 100000000
}

variable "file_path" {
    description = "Path to contracts output"
    type = string
    default = "."
}

variable "deploy_contracts" {
  description = "Should deploy contracts"
  type = bool
  default = false
}

variable "private_key" {
  description = "Private key for deployment"
  type = string
  default = ""
}

variable "module_name" {
  description = "Name of the module"
  type = string
  default = ""
}
