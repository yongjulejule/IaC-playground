import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
export class FIrstTestLambdaConstruct extends Construct {
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

export class SecondTestLambdaConstruct extends Construct {
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
