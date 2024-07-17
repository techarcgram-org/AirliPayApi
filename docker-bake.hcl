target "docker-metadata-action" {}

target "build" {
  inherits = ["docker-metadata-action"]
  context = "./"
  compose-file = "docker/production/docker-compose.yml"  
  platforms = [
    "linux/amd64",
  ]
}