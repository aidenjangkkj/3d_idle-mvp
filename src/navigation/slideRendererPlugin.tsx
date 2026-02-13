import type { StackflowReactPlugin } from "@stackflow/react/future";
import { WebBackBridge } from "./WebBackBridge";

export function slideRendererPlugin(): StackflowReactPlugin {
  return () => ({
    key: "plugin-renderer-slide",
    render({ stack }) {
      return (
        <div className="stackflow-stage">
          <WebBackBridge />
          {stack
            .render()
            .activities.filter(
              (activity) => activity.transitionState !== "exit-done"
            )
            .map((activity, index, arr) => (
              <div
                key={activity.key}
                className="stackflow-activity"
                data-transition={activity.transitionState}
                style={{ zIndex: index + (arr.length === 1 ? 1 : 10) }}
              >
                {activity.render()}
              </div>
            ))}
        </div>
      );
    },
  });
}
