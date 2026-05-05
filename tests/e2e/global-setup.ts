import { execSync } from 'node:child_process'
import { CONTAINER_NAME, E2E_PORT } from '../../playwright.config'

const DOCKER_CMD = process.env.DOCKER_CMD ?? 'docker'

export default function globalSetup() {
  execSync(`${DOCKER_CMD} run -d --name ${CONTAINER_NAME} -p ${E2E_PORT}:4566 floci/floci:latest`)
}
