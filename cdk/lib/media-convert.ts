import * as mediaconvert from "aws-cdk-lib/aws-mediaconvert";
import { Construct } from "constructs";

export class MediaConvertConstruct extends Construct {
  private readonly mediaConvertJobTemplate: mediaconvert.CfnJobTemplate;

  constructor(scope: Construct, name: string) {
    super(scope, name);

    if (!process.env.BUCKET_NAME) {
      throw new Error("BUCKET_NAME is not defined");
    }

    const 설정 = {
      OutputGroups: [
        {
          Outputs: [
            {
              ContainerSettings: {
                Container: "MP4",
                Mp4Settings: {
                  CslgAtom: "INCLUDE",
                  FreeSpaceBox: "EXCLUDE",
                  MoovPlacement: "PROGRESSIVE_DOWNLOAD",
                },
              },
              VideoDescription: {
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    MaxBitrate: 8_000_000, // youtube normal recommended bitrate for 1080p
                    RateControlMode: "QVBR",
                  },
                },
              },
            },
          ],
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: `s3://${process.env.BUCKET_NAME}/`,
            },
          },
        },
      ],
    };

    this.mediaConvertJobTemplate = new mediaconvert.CfnJobTemplate(
      this,
      "미디어 컨버트 잡 템플릿",
      { settingsJson: 설정, name: "미디어 컨버트 잡 템플릿" }
    );
  }

  public getMediaConvertJobTemplate(): mediaconvert.CfnJobTemplate {
    return this.mediaConvertJobTemplate;
  }
}
