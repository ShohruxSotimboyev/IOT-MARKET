// Mock socket implementation since the original was missing in the commit
export const getSocket = () => {
  return {
    connected: true,
    connect: () => {},
    on: () => {},
    off: () => {},
    emit: () => {}
  }
}
