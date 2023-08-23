import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

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
