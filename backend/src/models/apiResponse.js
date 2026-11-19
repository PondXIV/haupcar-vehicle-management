class APIResponse {
  constructor(Status, Data = {}) {
    this.Status = Status
    this.Data = Data
  }
}

module.exports = APIResponse
