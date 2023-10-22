import { it, expect } from "vitest";
import { oneToOneMachine } from "../one-to-one";
import { createActor } from "xstate";

it("allows to select a key and then a value to make a pair", () => {
  const actor = createActor(oneToOneMachine);
  actor.start();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": "a" });
});

it("allows to select a value and then a key to make a pair", () => {
  const actor = createActor(oneToOneMachine);
  actor.start();

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  actor.send({ type: "SELECT_KEY", keyId: "1" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": "a" });
});

it("allows to clear the selected key", () => {
  const actor = createActor(oneToOneMachine);
  actor.start();
  expect(actor.getSnapshot().context.selectedKey).toBeNull();
  expect(actor.getSnapshot().context.selectedValue).toBeNull();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  expect(actor.getSnapshot().context.selectedKey).toEqual("1");
  actor.send({ type: "SELECT_KEY", keyId: "1" });
  expect(actor.getSnapshot().context.selectedKey).toBeNull();

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  expect(actor.getSnapshot().context.selectedValue).toEqual("a");
  expect(actor.getSnapshot().context.entries).toEqual({});

  actor.send({ type: "SELECT_KEY", keyId: "2" });
  expect(actor.getSnapshot().context.entries).toEqual({ "2": "a" });
  expect(actor.getSnapshot().context.selectedKey).toBeNull();
  expect(actor.getSnapshot().context.selectedValue).toBeNull();
});

it("allows to clear a selected value", () => {
  const actor = createActor(oneToOneMachine);
  actor.start();

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  expect(actor.getSnapshot().context.selectedValue).toEqual("a");
  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  expect(actor.getSnapshot().context.selectedValue).toBeNull();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  expect(actor.getSnapshot().context.selectedKey).toEqual("1");
  expect(actor.getSnapshot().context.entries).toEqual({});

  actor.send({ type: "SELECT_VALUE", valueId: "b" });
  expect(actor.getSnapshot().context.entries).toEqual({ "1": "b" });
  expect(actor.getSnapshot().context.selectedKey).toBeNull();
  expect(actor.getSnapshot().context.selectedValue).toBeNull();
});

it("allows to overwrite an existing pair with a new value", () => {
  const actor = createActor(oneToOneMachine);
  actor.start();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "b" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": "b" });
});

it("allows to overwrite an existing pair with a new key", () => {
  const actor = createActor(oneToOneMachine);
  actor.start();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  actor.send({ type: "SELECT_KEY", keyId: "2" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  expect(actor.getSnapshot().context.entries).toEqual({ "2": "a" });
});

it("allows to deselect an existing pair by selecting its key and then its value", () => {
  const actor = createActor(oneToOneMachine, {
    input: { initialEntries: { "1": "a" } },
  });
  actor.start();
  expect(actor.getSnapshot().context.entries).toEqual({ "1": "a" });

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  expect(actor.getSnapshot().context.entries).toEqual({});
});

it("allows to deselect an existing pair by selecting its value and then its key", () => {
  const actor = createActor(oneToOneMachine, {
    input: { initialEntries: { "1": "a" } },
  });
  actor.start();
  expect(actor.getSnapshot().context.entries).toEqual({ "1": "a" });

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  actor.send({ type: "SELECT_KEY", keyId: "1" });

  expect(actor.getSnapshot().context.entries).toEqual({});
});
