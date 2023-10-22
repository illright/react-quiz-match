import { it, expect } from "vitest";
import { manyToManyMachine } from "../many-to-many";
import { createActor } from "xstate";

it("allows to select a key and then a value to make a pair", () => {
  const actor = createActor(manyToManyMachine);
  actor.start();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a"] });
});

it("allows to select a value and then a key to make a pair", () => {
  const actor = createActor(manyToManyMachine);
  actor.start();

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  actor.send({ type: "SELECT_KEY", keyId: "1" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a"] });
});

it("allows to select several keys and then a value to make multiple pairs", () => {
  const actor = createActor(manyToManyMachine);
  actor.start();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_KEY", keyId: "2" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a"], "2": ["a"] });
});

it("allows to select several values and then a key to make multiple pairs", () => {
  const actor = createActor(manyToManyMachine);
  actor.start();

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  actor.send({ type: "SELECT_VALUE", valueId: "b" });
  actor.send({ type: "SELECT_KEY", keyId: "1" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a", "b"] });

})

it("allows to select several keys and then a value when some of these pairs already exist to create the missing ones", () => {
  const actor = createActor(manyToManyMachine, {
    input: { initialEntries: { "1": ["a"] } },
  });
  actor.start();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_KEY", keyId: "2" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a"], "2": ["a"] });
});

it("allows to select several values and then a key when some of these pairs already exist to create the missing ones", () => {
  const actor = createActor(manyToManyMachine, {
    input: { initialEntries: { "1": ["a"] } },
  });
  actor.start();

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  actor.send({ type: "SELECT_VALUE", valueId: "b" });
  actor.send({ type: "SELECT_KEY", keyId: "1" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a", "b"] });
});

it("allows to clear selected keys", () => {
  const actor = createActor(manyToManyMachine);
  actor.start();
  expect(actor.getSnapshot().context.selectedKeys).toEqual([]);
  expect(actor.getSnapshot().context.selectedValues).toEqual([]);

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  expect(actor.getSnapshot().context.selectedKeys).toEqual(["1"]);
  actor.send({ type: "SELECT_KEY", keyId: "3" });
  expect(actor.getSnapshot().context.selectedKeys).toEqual(["1", "3"]);
  actor.send({ type: "SELECT_KEY", keyId: "3" });
  expect(actor.getSnapshot().context.selectedKeys).toEqual(["1"]);
  actor.send({ type: "SELECT_KEY", keyId: "1" });
  expect(actor.getSnapshot().context.selectedKeys).toEqual([]);

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  expect(actor.getSnapshot().context.selectedValues).toEqual(["a"]);
  expect(actor.getSnapshot().context.entries).toEqual({});

  actor.send({ type: "SELECT_KEY", keyId: "2" });
  expect(actor.getSnapshot().context.entries).toEqual({ "2": ["a"] });
  expect(actor.getSnapshot().context.selectedKeys).toEqual([]);
  expect(actor.getSnapshot().context.selectedValues).toEqual([]);
});

it("allows to clear selected values", () => {
  const actor = createActor(manyToManyMachine);
  actor.start();

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  expect(actor.getSnapshot().context.selectedValues).toEqual(["a"]);
  actor.send({ type: "SELECT_VALUE", valueId: "c" });
  expect(actor.getSnapshot().context.selectedValues).toEqual(["a", "c"]);
  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  expect(actor.getSnapshot().context.selectedValues).toEqual(["c"]);
  actor.send({ type: "SELECT_VALUE", valueId: "c" });
  expect(actor.getSnapshot().context.selectedValues).toEqual([]);

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  expect(actor.getSnapshot().context.selectedKeys).toEqual(["1"]);
  expect(actor.getSnapshot().context.entries).toEqual({});

  actor.send({ type: "SELECT_VALUE", valueId: "b" });
  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["b"] });
  expect(actor.getSnapshot().context.selectedKeys).toEqual([]);
  expect(actor.getSnapshot().context.selectedValues).toEqual([]);
});

it("allows to assign several values to a single key", () => {
  const actor = createActor(manyToManyMachine);
  actor.start();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "b" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a", "b"] });
});

it("allows to assign several keys to a single value", () => {
  const actor = createActor(manyToManyMachine);
  actor.start();

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  actor.send({ type: "SELECT_KEY", keyId: "2" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a"], "2": ["a"] });
});

it("allows to deselect an existing pair by selecting its key and then its value", () => {
  const actor = createActor(manyToManyMachine, {
    input: { initialEntries: { "1": ["a"] } },
  });
  actor.start();
  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a"] });

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  expect(actor.getSnapshot().context.entries).toEqual({});
});

it("allows to deselect an existing pair by selecting its value and then its key", () => {
  const actor = createActor(manyToManyMachine, {
    input: { initialEntries: { "1": ["a"] } },
  });
  actor.start();
  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a"] });

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  actor.send({ type: "SELECT_KEY", keyId: "1" });

  expect(actor.getSnapshot().context.entries).toEqual({});
});

it("allows to deselect several pairs at once by selecting all their keys and then their value", () => {
  const actor = createActor(manyToManyMachine, {
    input: { initialEntries: { "1": ["a"], "2": ["a"] } },
  });
  actor.start();
  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a"], "2": ["a"] });

  actor.send({ type: "SELECT_KEY", keyId: "1" });
  actor.send({ type: "SELECT_KEY", keyId: "2" });
  actor.send({ type: "SELECT_VALUE", valueId: "a" });

  expect(actor.getSnapshot().context.entries).toEqual({});
});

it("allows to deselect several pairs at once by selecting all their values and then their key", () => {
  const actor = createActor(manyToManyMachine, {
    input: { initialEntries: { "1": ["a", "b"] } },
  });
  actor.start();
  expect(actor.getSnapshot().context.entries).toEqual({ "1": ["a", "b"] });

  actor.send({ type: "SELECT_VALUE", valueId: "a" });
  actor.send({ type: "SELECT_VALUE", valueId: "b" });
  actor.send({ type: "SELECT_KEY", keyId: "1" });

  expect(actor.getSnapshot().context.entries).toEqual({});
});
