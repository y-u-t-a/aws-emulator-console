import { execSync } from 'node:child_process'
import { CONTAINER_NAME } from '../../playwright.config'

const DOCKER_CMD = process.env.DOCKER_CMD ?? 'docker'

export default function globalTeardown() {
  execSync(`${DOCKER_CMD} rm -f -v ${CONTAINER_NAME}`, { stdio: 'ignore' })
}
