/**
 * Created by as.krasilnikov on 21.03.2018.
 */

export class NotificationStrategy {
   getPosition(offset: number): object {
      return {
         right: 0,
         bottom: offset
      };
   }
}

export default new NotificationStrategy();
