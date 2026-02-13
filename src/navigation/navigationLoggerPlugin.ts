import type { StackflowReactPlugin } from "@stackflow/react/future";

function getVisibleDepth(stack: { activities: Array<{ transitionState: string }> }) {
  return stack.activities.filter(
    (activity) => activity.transitionState !== "exit-done"
  ).length;
}

export function navigationLoggerPlugin(): StackflowReactPlugin {
  return () => ({
    key: "plugin-navigation-logger",
    onPushed({ actions, effect }) {
      const stack = actions.getStack();
      console.log("[stackflow] push", {
        effect,
        depth: getVisibleDepth(stack),
        total: stack.activities.length,
      });
    },
    onPopped({ actions, effect }) {
      const stack = actions.getStack();
      console.log("[stackflow] pop", {
        effect,
        depth: getVisibleDepth(stack),
        total: stack.activities.length,
      });
    },
    onReplaced({ actions, effect }) {
      const stack = actions.getStack();
      console.log("[stackflow] replace", {
        effect,
        depth: getVisibleDepth(stack),
        total: stack.activities.length,
      });
    },
    onChanged({ actions, effect }) {
      const stack = actions.getStack();
      if (stack.globalTransitionState !== "idle") return;

      console.log("[stackflow] settled", {
        trigger: effect._TAG,
        depth: getVisibleDepth(stack),
        total: stack.activities.length,
      });
    },
  });
}
