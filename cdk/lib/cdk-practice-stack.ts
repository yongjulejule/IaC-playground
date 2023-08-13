import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

class FIrstTestLambdaConstruct extends Construct {
  private readonly function: lambda.Function;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.function = new lambda.Function(this, "FirstTestLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromInline(
        `exports.handler = (event) =>  {
          const value = Math.random()  < 0.5 
          const result = value ? { statusCode: 200 } : { statusCode: 400} 
          console.log("result is ", result);
          return result
      }`
      ),
      handler: "index.handler",
    });
  }

  public getFunction(): lambda.Function {
    return this.function;
  }
}

class SecondTestLambdaConstruct extends Construct {
  private readonly function: lambda.Function;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.function = new lambda.Function(this, "SecondTestLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromInline(
        `exports.handler = (event) =>  {
          const value = Math.random()  < 0.5 
          const result = value ? { statusCode: 200, body: "test1" } : { statusCode: 400, body: "test2"} 
          console.log("result is ", result);
          return result
      }`
      ),
      handler: "index.handler",
    });
  }

  public getFunction(): lambda.Function {
    return this.function;
  }
}

export class StepFunctionConstruct extends Construct {
  private readonly stateMachine: sfn.StateMachine;

  constructor(
    scope: Construct,
    id: string,
    props: { function1: lambda.Function; function2: lambda.Function }
  ) {
    super(scope, id);

    const { function1, function2 } = props;
    const jobSuccess = new sfn.Succeed(this, "Job Succeeded");
    const jobFailed = new sfn.Fail(this, "Job Failed");

    const isStartCondition = new sfn.Choice(this, "Is start condition?");

    const callFirstLambda = new tasks.LambdaInvoke(
      this,
      "Call firstTestLambda",
      {
        lambdaFunction: function1,
        invocationType: tasks.LambdaInvocationType.REQUEST_RESPONSE,
        outputPath: "$",
      }
    );
    const callSecondLambda = new tasks.LambdaInvoke(
      this,
      "Call secondTestLambda",
      {
        lambdaFunction: function2,
        invocationType: tasks.LambdaInvocationType.REQUEST_RESPONSE,
        outputPath: "$",
      }
    );

    const doNotStartCondition = sfn.Condition.stringEquals(
      "$.start",
      "undefined"
    );

    const lambdaSuccessCondition = sfn.Condition.not(
      sfn.Condition.numberEquals("$.StatusCode", 400)
    );

    const isFirstTestLambdaSuccess = new sfn.Choice(
      this,
      "is firstTestLambda Success?"
    );

    const isSecondTestLambdaSuccess = new sfn.Choice(
      this,
      "is secondTestLambda Success?"
    );

    const definition = isStartCondition
      .when(doNotStartCondition, jobSuccess)
      .otherwise(
        callFirstLambda.next(
          isFirstTestLambdaSuccess
            .when(
              lambdaSuccessCondition,
              callSecondLambda.next(
                isSecondTestLambdaSuccess
                  .when(lambdaSuccessCondition, jobSuccess)
                  .otherwise(jobFailed)
              )
            )
            .otherwise(jobFailed)
        )
      );

    this.stateMachine = new sfn.StateMachine(this, id, { definition });
  }

  public getStateMachine(): sfn.StateMachine {
    return this.stateMachine;
  }
}

export class CdkPracticeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const firstTestLambdaConstruct = new FIrstTestLambdaConstruct(
      this,
      "FirstTestLambdaConstruct"
    );

    const secondTestLambdaConstruct = new SecondTestLambdaConstruct(
      this,
      "SecondTestLambdaConstruct"
    );

    firstTestLambdaConstruct.getFunction().addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["states:SendTaskSuccess", "states:SendTaskFailure"],
        resources: ["*"],
        effect: iam.Effect.ALLOW,
      })
    );
    secondTestLambdaConstruct.getFunction().addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["states:SendTaskSuccess", "states:SendTaskFailure"],
        resources: ["*"],
        effect: iam.Effect.ALLOW,
      })
    );

    const stepFunctionConstruct = new StepFunctionConstruct(
      this,
      "StepFunctionConstruct",
      {
        function1: firstTestLambdaConstruct.getFunction(),
        function2: secondTestLambdaConstruct.getFunction(),
      }
    );
  }
}
