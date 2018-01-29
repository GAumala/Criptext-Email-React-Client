import { ThreadSuggestions } from '../actions/types';
import { Map, List } from 'immutable';
import * as TimeUtils from '../utils/TimeUtils';
import {
  parseAllContacts,
  buildParticipantsColumnString
} from '../utils/UserUtils';

export default (state = List([]), action) => {
  switch (action.type) {
    case ThreadSuggestions.SET_THREADS: {
      return List(
        action.threads.map(thread => {
          const testUsers = 'Criptext Info <no-reply@criptext.com>';
          const contacts = parseAllContacts(testUsers);
          return Map(thread).merge({
            header: buildParticipantsColumnString(contacts),
            date: TimeUtils.defineTimeByToday(thread.date),
            totalAttachments: 1,
            participants: testUsers
          });
        })
      );
    }
    default:
      return state;
  }
};