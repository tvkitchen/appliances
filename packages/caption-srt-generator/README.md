# TV Kitchen Caption SRT Generator Appliance

---
inputTypes: TEXT.ATOM
outputTypes: TEXT.SRT
---

The Caption SRT Generator appliance ingests a stream of captions and converts them into the [SubRip file format](https://en.wikipedia.org/wiki/SubRip).

Timestamps are determined by the `position` value of the `TEXT.ATOM` payloads processed.

## Configuration Options
The appliance takes in the following configuration values:

* `includeCounter` (boolean): determines if the output includes a counter as part of the text of each payload.

## Examples

**includeCounter: true (default)**
```
Payload {
  data: "2\n00:00:19,886 --> 00:00:20,787\n>>> WE'RE BACK ON WHAT HAS BEEN\n",
  type: 'TEXT.SRT',
  createdAt: '2021-02-18T20:17:50.583Z',
  timestamp: '',
  duration: 901,
  position: 19886
}
```

**includeCounter: false**
```
Payload {
  data: "00:00:19,886 --> 00:00:20,787\n>>> WE'RE BACK ON WHAT HAS BEEN\n",
  type: 'TEXT.SRT',
  createdAt: '2021-02-18T20:17:50.583Z',
  timestamp: '',
  duration: 901,
  position: 19886
}
```

## Dependencies
This appliance has no external dependencies.

## About the TV Kitchen
TV Kitchen is a project of [Bad Idea Factory](https://biffud.com).  Learn more at [the TV Kitchen project site](https://tv.kitchen).

