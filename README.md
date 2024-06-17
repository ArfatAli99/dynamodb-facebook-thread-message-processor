## Facebook Thread Message Archiver (DynamoDB Trigger)

This repository implements a DynamoDB trigger that processes newly inserted Facebook thread entries. Upon detecting a new thread record, the trigger fetches all associated messages from Facebook and stores them in a separate DynamoDB table.

### Features

- **Automated Message Archiving:** Efficiently archives all messages belonging to a Facebook thread upon its creation in DynamoDB.
- **Scalable Storage:** Leverages DynamoDB for scalable and reliable message storage.
- **Trigger-Based Processing:** Ensures automatic message archiving without manual intervention.

### Requirements

- AWS Account with DynamoDB access
- Facebook API access (credentials not stored in this repository)

### Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/<your-username>/facebook-thread-message-archiver.git
   ```

2. **Configuration:**

   - Update the code with your DynamoDB table names (source and destination) and any necessary Facebook API credentials.
   - Refer to the AWS documentation for creating and configuring DynamoDB tables [https://docs.aws.amazon.com/dynamodb/](https://docs.aws.amazon.com/dynamodb/).

3. **Deployment:**

   - Follow the AWS documentation to deploy the Lambda function associated with the DynamoDB trigger.

### Usage

This trigger is designed to run automatically upon Facebook thread insertions in the source DynamoDB table. No manual invocation is required.

### Contributing

We welcome contributions to this project!
