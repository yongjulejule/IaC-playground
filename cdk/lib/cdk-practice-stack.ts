import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { FIrstTestLambdaConstruct, SecondTestLambdaConstruct } from "./lambdas";
import { StepFunctionConstruct } from "./step-function";
import { MediaConvertConstruct } from "./media-convert";

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

    const 미디어컨버터_템플릿 = new MediaConvertConstruct(
      this,
      "미디어컨퍼터_컨스트럭트인데_템플릿을_만듦"
    );
  }
}
