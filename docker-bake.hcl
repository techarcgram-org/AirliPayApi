target "docker-metadata-action" {}

target "build" {
  inherits = ["docker-metadata-action"]
  context = "./docker/production"
  compose-file = "docker-compose.yml"  
  platforms = [
    "linux/amd64",
  ]
}