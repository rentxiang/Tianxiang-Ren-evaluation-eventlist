const eventsAPIs = (function () {
  const API_URL = "http://localhost:3000/events";

  async function getEvents() {
    return fetch(API_URL).then((res) => res.json());
  }

  async function addEvent(newEvent) {
    return fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    }).then((res) => res.json());
  }

  async function deleteEvent(id) {
    return fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  }

  async function updateEvent(id, updatedEvent) {
    return fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedEvent),
    }).then((res) => res.json());
  }

  return {
    updateEvent,
    getEvents,
    addEvent,
    deleteEvent,
  };
})();

class EventsView {
  constructor() {
    this.newEventForm = document.querySelector(".new-event-form");
    this.eventInput = document.querySelector("#new-event");
    this.eventList = document.querySelector(".event-list");
  }

  clearInput() {
    this.eventInput.value = "";
  }

  renderEvents(events) {
    this.eventList.innerHTML = "";
    events.forEach((event) => {
      this.renderNewEvent(event);
    });
  }

  removeEventElem(id) {
    document.getElementById(id).remove();
  }

  renderNewEvent(newEvent) {
    this.eventList.appendChild(this.createEventElement(newEvent));
  }


  createEventElement(event) {
    const eventElement = document.createElement("tr");
    eventElement.classList.add("event");
    eventElement.setAttribute("id", event.id);
    eventElement.innerHTML = `
    <th scope="row"> <input class="event_name-input" type="text" value="${event.eventName}" readonly/></th>
    <td><input class="event_start-date" type="date" value="${event.startDate}" readonly/></td>
    <td><input class="event_end-date" type="date" value="${event.endDate}" readonly/></td>
    <td><button class="event__edit-btn">Edit</button></td>
    <td><button class="event__del-btn">Delete</button></td>
    `;
    const editBtn = eventElement.querySelector(".event__edit-btn");

    editBtn.addEventListener("click", async () => {
      if (editBtn.textContent === "Edit") {
        editBtn.textContent = "Submit";
        const inputs = eventElement.querySelectorAll("input");
        inputs.forEach((input) => input.removeAttribute("readonly"));
      } else {
          const eventNameInput = eventElement.querySelector('.event_name-input');
          const startDateInput = eventElement.querySelector('.event_start-date');
          const endDateInput = eventElement.querySelector('.event_end-date');
          const updatedEvent = {
            eventName: eventNameInput.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value
          };
          await eventsAPIs.updateEvent(event.id, updatedEvent);
          this.model.updateEvent(event.id, updatedEvent);
          editBtn.textContent = "Edit";
          const inputs = eventElement.querySelectorAll("input");
          inputs.forEach((input) => input.setAttribute("readonly"));
      }
    });

    return eventElement;
  }
}

class EventsModel {
  #events;
  constructor(events = []) {
    this.#events = events;
  }

  getEvents() {
    return this.#events;
  }

  setEvents(newEvents) {
    this.#events = newEvents;
  }

  addEvent(newEvent) {
    this.#events.push(newEvent);
  }

  deleteEvent(id) {
    this.#events = this.#events.filter((event) => event.id !== id);
  }

  //   updateEvent(id){
  //     this.#events = this.#events.filter((event) => event.id == id);
  //   }
  updateEvent(id, updatedEventData) {
    const eventToUpdate = this.#events.find((event) => event.id === id);
    if (eventToUpdate) {
      Object.assign(eventToUpdate, updatedEventData);
    }
  }
}

class EventsController {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.init();
  }

  init() {
    this.setUpEvents();
    this.fetchEvents();
  }

  setUpEvents() {
    this.setUpSubmitEvent();
    this.setUpDeleteEvent();
  }

  async fetchEvents() {
    const events = await eventsAPIs.getEvents();
    this.model.setEvents(events);
    this.view.renderEvents(events);
  }

  setUpDeleteEvent() {
    this.view.eventList.addEventListener("click", async (e) => {
      const elem = e.target;
      if (elem.classList.contains("event__del-btn")) {
        const eventElem = elem.parentElement.parentElement;
        const deleteId = eventElem.id;
        await eventsAPIs.deleteEvent(deleteId);
        this.model.deleteEvent(deleteId);
        this.view.removeEventElem(deleteId);
      }
    });
  }

  setUpdateEvent() {
    this.view.eventList.addEventListener("click", async (e) => {
      const elem = e.target;
      if (elem.classList.contains("event__update-btn")) {
        const eventElem = elem.parentElement.parentElement;
        const updateId = eventElem.id;
        const eventName = eventElem.querySelector(".event_name-iput").value;
        const startDate = eventElem.querySelector(".event_start-date").value;
        const endDate = eventElem.querySelector(".event_end-date").value;

        const updatedEvent = {
          eventName,
          startDate,
          endDate,
        };

        await eventsAPIs.updateEvent(updateId, updatedEvent);
        this.model.updateEvent(updateId, updatedEvent);
      }
    });
  }

  setUpSubmitEvent() {
    this.view.newEventForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newEvent = { eventName: "", startDate: "", endDate: "" };
      const createdEvent = await eventsAPIs.addEvent(newEvent); 
      this.model.addEvent(createdEvent);
      this.view.renderNewEvent(createdEvent);
      this.view.clearInput();
    });
  }
}

const eventsView = new EventsView();
const eventsModel = new EventsModel();
const eventsController = new EventsController(eventsView, eventsModel);
